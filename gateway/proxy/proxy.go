package proxy

import (
    "context"
    "fmt"
    "errors"
    "io"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
    "os"
    "sync"

    "porters/db"
)

func Start() {
    // TODO grab url for gateway kit
    proxyUrl := os.Getenv("PROXY_TO")
    remote, err := url.Parse(proxyUrl)
    log.Println("remote", remote)
    if err != nil {
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
            pong, err := db.Healthcheck()
            resp.Header().Set("Content-Type", "application/json")
            var json string
            if err != nil {
                json = fmt.Sprintf(`{"redis": "%s"}`, err.Error())
            } else {
                json = fmt.Sprintf(`{"redis": "%s"}`, pong)
            }
            io.WriteString(resp, json)
        }
    }

    revProxy := setupProxy(remote)
    http.HandleFunc("/", handler(revProxy))
    http.HandleFunc("/health", healthHandler())
    err2 := http.ListenAndServe(":9000", nil)
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

        log.Println(req)
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
            err := NewLifecycleIncompleteError()
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
        log.Println(err)
        var httpErr *HTTPError
        if errors.As(err, &httpErr) {
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

