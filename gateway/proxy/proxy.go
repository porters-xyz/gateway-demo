package proxy

import (
    "context"
    "errors"
    "fmt"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
    "time"

    "github.com/gorilla/mux"

    "porters/common"
)

var server *http.Server

func Start() {
    // TODO grab url for gateway kit
    proxyUrl := common.GetConfig(common.PROXY_TO)
    remote, err := url.Parse(proxyUrl)
    log.Println("remote", remote)
    if err != nil {
        // TODO probably panic here, can't proxy anywhere
        log.Println(err)
    }

    handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            log.Println(req.URL)
            setupContext(req)
            proxy.ServeHTTP(resp, req)
        }
    }

    revProxy := setupProxy(remote)
    router := mux.NewRouter()
    // TODO put health check on subroute

    proxyRouter := addProxyRoutes(router)
    proxyRouter.HandleFunc(fmt.Sprintf(`/{%s}`, APP_PATH), handler(revProxy))

    _ = addHealthcheckRoute(router)

    server = &http.Server{Addr: ":9000", Handler: router}
    go func() {
        err := server.ListenAndServe()
        if err != nil {
            log.Println("server error", err)
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
        log.Println("error shutting down", err)
    } else {
        log.Println("shutdown successful")
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
        // TODO proxy to pokt chain id
        //req.URL.Path = PROXY_TO + mapping

        cancel := RequestCanceler(req)

        for _, p := range (*reg).plugins {
            h, ok := p.(PreHandler)
            if ok {
                log.Println("encountered", p.Name())
                select {
                case <-req.Context().Done():
                    return
                default:
                    h.HandleRequest(req)
                }
            }
        }

        // Cancel if necessary lifecycle stages not completed
        lifecycle := lifecycleFromContext(req.Context())
        if !lifecycle.checkComplete() {
            err := LifecycleIncompleteError
            log.Println("lifecycle incomplete", lifecycle)
            cancel(err)
        }
    }

    revProxy.ModifyResponse = func(resp *http.Response) error {
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
        return err
    }

    revProxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
        // TODO handle errors elegantly
        log.Println("handling error:", err)
        var httpErr *HTTPError
        cause := context.Cause(req.Context())
        log.Println("cancel cause", cause)
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
    lifecyclectx := Lifecycle{}.UpdateContext(ctx)
    *req = *req.WithContext(lifecyclectx)
}

