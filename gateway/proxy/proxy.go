package proxy

import (
    "context"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
    "os"
    "sync"
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

            runFilterChain(ctx, prefilters, resp, req)

            // TODO meant to track incoming requests without slowing things down, read-only
            //nonBlockingPrehandlers(ctx, resp, req)
            lifecycle := ctx.Value(LIFECYCLE)
            if lifecycle == nil || !lifecycle.(Lifecycle).checkComplete() {
                cancel()
            } else {
                proxy.ServeHTTP(resp, req)
            }

            // TODO is this needed? after serving blocking may be dumb
            //blockingPosthandlers(ctx, resp, req)

            // TODO any longer tasks that should spawn after handling request
            //nonBlockingPosthandlers(ctx, resp, req)
        }
    }

    revProxy := httputil.NewSingleHostReverseProxy(remote)
    http.HandleFunc("/", handler(revProxy))
    err2 := http.ListenAndServe(":9000", nil)
    if err2 != nil {
        panic(err2)
    }
}

func setupContext(req *http.Request) (context.Context, context.CancelFunc) {
    // TODO read ctx from request and make any modifications
    parent := req.Context()
    ctx := context.WithValue(parent, LIFECYCLE, Lifecycle{})
    ctx, cancel := context.WithCancel(parent)
    return ctx, cancel
}

func runFilterChain(ctx context.Context, fc FilterChain, resp http.ResponseWriter, req *http.Request) {
    nextCtx := ctx
    for _, f := range fc.filters {
        retCtx, err := func() (context.Context, error) {
            select {
            case <-ctx.Done():
                return nextCtx, nextCtx.Err()
            default:
                log.Println("filtering", f.Name())
                return f.Filter(nextCtx, resp, req), nil
            }
        }()
        if err != nil {
            // TODO cleanup
            return
        }
        nextCtx = retCtx
    }
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
