package proxy

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io/ioutil"
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
				// log.Info("Received request",
				// 	"method", req.Method,
				// 	"url", req.URL.String(),
				// 	"remoteAddr", req.RemoteAddr,
				// 	"userAgent", req.UserAgent(),
				// )

				// Log Request Method and URL
				log.Info("Received request", "method", req.Method, "url", req.URL.String())

				// Log Remote Address and User Agent
				log.Info("Request details", "remoteAddr", req.RemoteAddr, "userAgent", req.UserAgent())

				// Log Request Headers
				for name, values := range req.Header {
					for _, value := range values {
						log.Info("Request header", "name", name, "value", value)
					}
				}

				// Log Request Body
				bodyBytes, err := ioutil.ReadAll(req.Body)
				if err != nil {
					log.Error("Failed to read request body", "error", err)
				} else {
					log.Info("Request body", "body", string(bodyBytes))
					// Re-assign the body if it needs to be read later
					req.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
				}

				// Log TLS Details if present
				if req.TLS != nil {
					log.Info("TLS details", "version", req.TLS.Version, "cipherSuite", req.TLS.CipherSuite)
				}

				// Log Connection Details
				localAddr := req.Context().Value(http.LocalAddrContextKey)
				log.Info("Connection details", "localAddr", localAddr, "remoteAddr", req.RemoteAddr)

				// Log Query Parameters
				for name, values := range req.URL.Query() {
					for _, value := range values {
						log.Info("Query parameter", "name", name, "value", value)
					}
				}
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
		logEvent := common.Enabled(common.LOG_HTTP_REQUEST) && common.ShouldLogRequest(req.URL.Path)
		if logEvent {
			log.Info("Director Handler starting", "method", req.Method, "url", req.URL.String())
		}

		// Store the original URL in the context. Needed for logging
		originalURL := req.URL.String()
		ctx := context.WithValue(req.Context(), "originalURL", originalURL)
		req = req.WithContext(ctx)

		defaultDirector(req)

		cancel := RequestCanceler(req)
		req.Host = remote.Host

		poktId, ok := lookupPoktId(req)
		if !ok {
			cancel(ChainNotSupportedError)
		}
		target := utils.NewTarget(remote, poktId)
		req.URL = target.URL()

		if logEvent {
			log.Info("Director Handler set new target & starting plugins", "method", req.Method, "url", req.URL.String())
		}

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

		if logEvent {
			log.Info("Director Handler finished calling plugins", "method", req.Method, "url", req.URL.String())
		}

		// Cancel if necessary lifecycle stages not completed
		lifecycle := lifecycleFromContext(req.Context())
		if !lifecycle.checkComplete() {
			err := LifecycleIncompleteError
			log.Debug("lifecycle incomplete", "mask", lifecycle)

			if logEvent {
				log.Info("Director Handler lifecycle incomplete", "method", req.Method, "url", req.URL.String())
			}

			cancel(err)
		}

		if common.Enabled(common.INSTRUMENT_ENABLED) {
			if logEvent {
				log.Info("Director Handler starting Instrument logging", "method", req.Method, "url", req.URL.String())
			}
			ctx := req.Context()
			instr, ok := common.FromContext(ctx, common.INSTRUMENT)
			if ok {
				start := instr.(*common.Instrument).Timestamp
				elapsed := time.Now().Sub(start)
				common.LatencyHistogram.WithLabelValues("setup").Observe(float64(elapsed))

				ctx = common.UpdateContext(ctx, common.StartInstrument())
				*req = *req.WithContext(ctx)
			}
			if logEvent {
				log.Info("Director Handler finished Instrument logging", "method", req.Method, "url", req.URL.String())
			}
		}

		if logEvent {
			log.Info("Director Handler ready", "method", req.Method, "url", req.URL.String())
		}
	}

	revProxy.ModifyResponse = func(resp *http.Response) error {
		// Retrieve the original URL from the context
		//originalURL, _ := resp.Request.Context().Value("originalURL").(string)

		logEvent := common.Enabled(common.LOG_HTTP_REQUEST) //&& common.ShouldLogRequest(originalURL)
		if logEvent {
			log.Info("ModifyResponse Handler starting", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
		}

		ctx := resp.Request.Context()
		defaultHeaders(resp)

		if common.Enabled(common.INSTRUMENT_ENABLED) {
			if logEvent {
				log.Info("ModifyResponse Handler starting instrument logging", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
			}
			instr, ok := common.FromContext(ctx, common.INSTRUMENT)
			if ok {
				start := instr.(*common.Instrument).Timestamp
				elapsed := time.Now().Sub(start)
				common.LatencyHistogram.WithLabelValues("serve").Observe(float64(elapsed))
			}
			if logEvent {
				log.Info("ModifyResponse Handler finished instrument logging", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
			}
		}

		if logEvent {
			log.Info("ModifyResponse Handler starting plugins", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
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

		if logEvent {
			log.Info("ModifyResponse Handler finished calling plugins", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
		}

		if common.Enabled(common.LOG_HTTP_RESPONSE) || logEvent {
			log.Info("Response", "resp", resp)
		}

		if resp.StatusCode < 400 && err == nil {
			if logEvent {
				log.Info("ModifyResponse Handler adding usage updater", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
			}
			updater := db.NewUsageUpdater(ctx, "success")
			common.GetTaskQueue().Add(updater)
			if logEvent {
				log.Info("ModifyResponse Handler finished adding usage updater", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String())
			}
		}

		if logEvent {
			log.Info("ModifyResponse Handler returning response error", "method", resp.Request.Method, "modifiedURL", resp.Request.URL.String(), "err", err)
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
