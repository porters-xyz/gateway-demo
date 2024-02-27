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
    if err != nil {
        log.Println(err)
    }

    handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            log.Println(req.URL)
            ctx, cancel := setupContext(req)

            // TODO move to filter
            req.Host = remote.Host

            pluginRegistry := GetRegistry()

            // TODO structure this in a reasonable way
            prefilters := pluginRegistry.GetFilterChain(PRE)

            ctx, err := runFilterChain(ctx, prefilters, resp, req)
            if err != nil {
                var httpErr *HTTPError
                var code int
                if errors.As(err, &httpErr) {
                    code = httpErr.code
                } else {
                    code = http.StatusInternalServerError
                }

                http.Error(resp, err.Error(), code)
                return
            }

            // TODO meant to track incoming requests without slowing things down, read-only
            //nonBlockingPrehandlers(ctx, resp, req)

            lifecycle := lifecycleFromContext(ctx)
            log.Println("lifecycle", lifecycle)
            if !lifecycle.checkComplete() {
                cancel()
                status := http.StatusInternalServerError
                http.Error(resp, http.StatusText(status), status)
            } else {
                log.Println("actually serving")
                proxy.ServeHTTP(resp, req)
            }

            // TODO is this needed? after serving blocking may be dumb
            //blockingPosthandlers(ctx, resp, req)

            // TODO any longer tasks that should spawn after handling request
            //nonBlockingPosthandlers(ctx, resp, req)
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

    revProxy := httputil.NewSingleHostReverseProxy(remote)
    http.HandleFunc("/", handler(revProxy))
    http.HandleFunc("/health", healthHandler())
    err2 := http.ListenAndServe(":9000", nil)
    if err2 != nil {
        panic(err2)
    }
}

func setupContext(req *http.Request) (context.Context, context.CancelFunc) {
    // TODO read ctx from request and make any modifications
    parent := req.Context()
    ctx, cancel := context.WithCancel(parent)
    ctx, _ = Lifecycle{}.UpdateContext(ctx)
    return ctx, cancel
}

func runFilterChain(ctx context.Context, fc FilterChain, resp http.ResponseWriter, req *http.Request) (context.Context, error) {
    nextCtx := ctx
    for _, f := range fc.filters {
        retCtx, err := func() (context.Context, error) {
            log.Println("filtering", f.Name())
            select {
            case <-nextCtx.Done():
                return nextCtx, nextCtx.Err()
            default:
                return f.Filter(nextCtx, resp, req)
            }
        }()
        if err != nil {
            log.Println(err)
            return nil, err
        }
        nextCtx = retCtx
    }
    return nextCtx, nil
}

func runProcessingSet(ctx context.Context, procs ProcessorSet, resp http.ResponseWriter, req *http.Request) sync.WaitGroup {
    var wg sync.WaitGroup
    for _, p := range procs.procs {
        go func() {
            p.Process(ctx, resp, req)
        }()
        wg.Add(1)
    }
    return wg
}
