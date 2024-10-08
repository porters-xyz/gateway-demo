package proxy

import (
	"context"
	"errors"
	"fmt"
	log "log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/gorilla/mux"

	"porters/common"
	"porters/db"
	"porters/utils"
)

var server *http.Server

func Start() {
	proxyUrl := common.GetConfig(common.PROXY_TO)
	remote, err := url.Parse(proxyUrl)
	if err != nil {
		log.Error("unable to parse proxy to", "err", err)
		panic("unable to start with invalid remote url")
	}
	log.Info("proxying to remote", "url", remote)

	handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
		return func(resp http.ResponseWriter, req *http.Request) {
			//Note this is used for debugging purposes only and is not meant to be on by default. Logs are automatically removed every 30 days.
			//Additionally the RemoteAddr logs the internal IP from the load balancer so no external IPs are leaked
			//Log request if URL path matches any of the filters
			if common.Enabled(common.LOG_HTTP_REQUEST) && common.ShouldLogRequest(req.URL.Path) {
				log.Info("Received request",
					"method", req.Method,
					"url", req.URL.String(),
					"remoteAddr", req.RemoteAddr,
					"userAgent", req.UserAgent(),
				)
			}

			setupContext(req)

			if common.Enabled(common.LOG_HTTP_REQUEST) && common.ShouldLogRequest(req.URL.Path) {
				log.Info("Starting to serve request via reverse proxy", "url", req.URL.String())
			}

			proxy.ServeHTTP(resp, req)

			if common.Enabled(common.LOG_HTTP_REQUEST) && common.ShouldLogRequest(req.URL.Path) {
				log.Info("Finished serving request via reverse proxy", "url", req.URL.String())
			}
		}
	}

	revProxy := setupProxy(remote)
	router := mux.NewRouter()

	proxyRouter := addProxyRoutes(router)
	proxyRouter.HandleFunc(fmt.Sprintf(`/{%s}`, APP_PATH), handler(revProxy))

	_ = addHealthcheckRoute(router)
	_ = addMetricsRoute(router)
	_ = addMetricsKitRoute(router, proxyUrl)

	port := fmt.Sprintf(":%d", common.GetConfigInt(common.PORT))
	server = &http.Server{Addr: port, Handler: router}
	go func() {
		err := server.ListenAndServe()
		if err != nil {
			log.Error("server error encountered", "err", err)
		}
	}()
}

func Stop() {
	// 5 second shutdown
	shutdownTime := time.Duration(common.GetConfigInt(common.SHUTDOWN_DELAY)) * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), shutdownTime)
	defer cancel()

	err := server.Shutdown(ctx)
	if err != nil {
		log.Error("error shutting down", "err", err)
	} else {
		log.Info("shutdown successful")
	}
}

func RequestCanceler(req *http.Request) context.CancelCauseFunc {
	ctx, cancel := context.WithCancelCause(req.Context())
	*req = *req.WithContext(ctx)
	return cancel
}

func setupProxy(remote *url.URL) *httputil.ReverseProxy {
	revProxy := httputil.NewSingleHostReverseProxy(remote)
	reg := GetRegistry()

	defaultDirector := revProxy.Director
	revProxy.Director = func(req *http.Request) {
		defaultDirector(req)

		cancel := RequestCanceler(req)
		req.Host = remote.Host

		poktId, ok := lookupPoktId(req)
		if !ok {
			cancel(ChainNotSupportedError)
		}
		target := utils.NewTarget(remote, poktId)
		req.URL = target.URL()

		for _, p := range (*reg).plugins {
			h, ok := p.(PreHandler)
			if ok {
				select {
				case <-req.Context().Done():
					return
				default:
					err := h.HandleRequest(req)
					if err != nil {
						log.Error("Failed running HandleRequest proxy filter", "filter", p.Name())
						cancel(err)
					}
				}
			}
		}

		// Cancel if necessary lifecycle stages not completed
		lifecycle := lifecycleFromContext(req.Context())
		if !lifecycle.checkComplete() {
			err := LifecycleIncompleteError
			log.Debug("lifecycle incomplete", "mask", lifecycle)

			cancel(err)
		}

		if common.Enabled(common.INSTRUMENT_ENABLED) {
			ctx := req.Context()
			instr, ok := common.FromContext(ctx, common.INSTRUMENT)
			if ok {
				start := instr.(*common.Instrument).Timestamp
				elapsed := time.Now().Sub(start)
				common.LatencyHistogram.WithLabelValues("setup").Observe(float64(elapsed))

				ctx = common.UpdateContext(ctx, common.StartInstrument())
				*req = *req.WithContext(ctx)
			}
		}
	}

	revProxy.ModifyResponse = func(resp *http.Response) error {
		ctx := resp.Request.Context()
		defaultHeaders(resp)

		if common.Enabled(common.INSTRUMENT_ENABLED) {
			instr, ok := common.FromContext(ctx, common.INSTRUMENT)
			if ok {
				start := instr.(*common.Instrument).Timestamp
				elapsed := time.Now().Sub(start)
				common.LatencyHistogram.WithLabelValues("serve").Observe(float64(elapsed))
			}
		}

		var err error
		for _, p := range (*reg).plugins {
			h, ok := p.(PostHandler)
			if ok {
				newerr := h.HandleResponse(resp)
				if newerr != nil {
					err = errors.Join(err, newerr)
				}
			}
		}

		if common.Enabled(common.LOG_HTTP_RESPONSE) {
			log.Info("Response", "resp", resp)
		}

		if resp.StatusCode < 400 && err == nil {
			updater := db.NewUsageUpdater(ctx, "success")
			common.GetTaskQueue().Add(updater)
		}

		return err
	}

	revProxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
		ctx := req.Context()
		var httpErr *HTTPError
		cause := context.Cause(ctx)

		if errors.Is(cause, context.Canceled) {
			log.Warn("Request canceled by client", "url", req.URL.String())
		} else {
			log.Error("Error during relay attempt", "cause", cause, "error", err)
		}

		//While we are getting the context, when handling the error state we have no guarantee the app has been set
		//So we must assume it has not...
		appId := PluckAppId(req)

		app := &db.App{Id: appId}
		ctx, err = app.Lookup(ctx)

		updater := db.NewUsageUpdater(ctx, "failure")
		common.GetTaskQueue().Add(updater)

		if errors.As(cause, &httpErr) {
			status := httpErr.code
			http.Error(resp, http.StatusText(status), status)
		} else if err != nil {
			status := http.StatusBadGateway
			http.Error(resp, http.StatusText(status), status)
		}
	}

	return revProxy
}

func setupContext(req *http.Request) {
	ctx := req.Context()
	ctx = common.UpdateContext(ctx, &Lifecycle{})
	if common.Enabled(common.INSTRUMENT_ENABLED) {
		ctx = common.UpdateContext(ctx, common.StartInstrument())
	}
	*req = *req.WithContext(ctx)
}

// Add or remove headers on response
// Dealing with CORS mostly
func defaultHeaders(resp *http.Response) {
	resp.Header.Set("Access-Control-Allow-Headers", "authorization, content-type, server")
	resp.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	resp.Header.Set("Access-Control-Allow-Origin", "*")
}

func lookupPoktId(req *http.Request) (string, bool) {
	ctx := req.Context()
	name := PluckProductName(req)
	product := &db.Product{Name: name}
	ctx, err := product.Lookup(ctx)
	if err != nil {
		log.Error("product not found", "product", product.Name, "err", err)
		return "", false
	}
	productCtx := common.UpdateContext(ctx, product)
	*req = *req.WithContext(productCtx)
	return product.PoktId, true
}
