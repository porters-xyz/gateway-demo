package proxy

import (
    "context"
    "errors"
    "fmt"
    log "log/slog"
    "net/url"
    "net/http"
    "net/http/httputil"
    "time"

    "github.com/gorilla/mux"

    "porters/common"
    "porters/db"
    "porters/utils"
)

var server *http.Server

func Start() {
    // TODO grab url for gateway kit
    proxyUrl := common.GetConfig(common.PROXY_TO)
    remote, err := url.Parse(proxyUrl)
    if err != nil {
        log.Error("unable to parse proxy to", "err", err)
        panic("unable to start with invalid remote url")
    }
    log.Debug("proxying to remote", "url", remote)

    handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            setupContext(req)
            proxy.ServeHTTP(resp, req)
        }
    }

    revProxy := setupProxy(remote)
    router := mux.NewRouter()

    proxyRouter := addProxyRoutes(router)
    proxyRouter.HandleFunc(fmt.Sprintf(`/{%s}`, APP_PATH), handler(revProxy))

    _ = addHealthcheckRoute(router)
    _ = addMetricsRoute(router)

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

        req.Host = remote.Host

        poktId := lookupPoktId(req)
        target := utils.NewTarget(remote, poktId)
        req.URL = target.URL()

        cancel := RequestCanceler(req)

        for _, p := range (*reg).plugins {
            h, ok := p.(PreHandler)
            if ok {
                select {
                case <-req.Context().Done():
                    return
                default:
                    err := h.HandleRequest(req)
                    if err != nil {
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
    }

    revProxy.ModifyResponse = func(resp *http.Response) error {
        ctx := resp.Request.Context()
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
        
        if resp.StatusCode < 400 && err == nil {
            updater := db.NewUsageUpdater(ctx, "success")
            common.GetTaskQueue().Add(updater)
        }

        return err
    }

    revProxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
        // TODO handle errors elegantly
        ctx := req.Context()
        var httpErr *HTTPError
        cause := context.Cause(ctx)

        updater := db.NewUsageUpdater(ctx, "failure")
        common.GetTaskQueue().Add(updater)
        
        log.Debug("cancel cause", "cause", cause)
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
    // TODO read ctx from request and make any modifications
    ctx := req.Context()
    lifecyclectx := common.UpdateContext(ctx, &Lifecycle{})
    *req = *req.WithContext(lifecyclectx)
}

func lookupPoktId(req *http.Request) string {
    ctx := req.Context()
    name := PluckProductName(req)
    product := &db.Product{Name: name}
    err := product.Lookup(ctx)
    if err != nil {
        // TODO pick appropriate HTTP code
        log.Error("product not found", "product", product.Name, "err", err)
    }
    productCtx := common.UpdateContext(ctx, product) 
    *req = *req.WithContext(productCtx)
    // TODO put product into context for usage and weight purposes
    return product.PoktId
}
