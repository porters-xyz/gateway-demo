package proxy

import (
    "context"
    "errors"
    "io"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
    "os"

    "github.com/gorilla/mux"

    "porters/db"
)

func Start() {
    // TODO grab url for gateway kit
    proxyUrl := os.Getenv("PROXY_TO")
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

    healthHandler := func() func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            hc := (&db.Cache{}).Healthcheck()
            resp.Header().Set("Content-Type", "application/json")
            io.WriteString(resp, hc.ToJson())
        }
    }

    revProxy := setupProxy(remote)
    router := mux.NewRouter()
    router.HandleFunc("/{appId}", handler(revProxy))
    router.HandleFunc("/health", healthHandler())
    err2 := http.ListenAndServe(":9000", router)
    if err2 != nil {
        panic(err2)
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

        // TODO move to filter
        req.Host = remote.Host

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

