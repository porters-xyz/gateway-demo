package proxy

import (
    "context"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
    "sync"
)

func Start() {
    // TODO grab url for gateway kit
    remote, err := url.Parse("http://localhost:9999")
    if err != nil {
        log.Println(err)
    }

    handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            log.Println(req.URL)
            ctx := setupContext(req)

            // TODO move to filter
            req.Host = remote.Host

            pluginRegistry := GetRegistry()

            // TODO structure this in a reasonable way
            prefilters := pluginRegistry.GetFilterChain(PRE)

            runFilterChain(ctx, prefilters, resp, req)

            // TODO meant to track incoming requests without slowing things down, read-only
            //nonBlockingPrehandlers(ctx, resp, req)

            // TODO any ctx adjustments
            proxy.ServeHTTP(resp, req)

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

func setupContext(req *http.Request) context.Context {
    // TODO read ctx from request and make any modifications
    return req.Context()
}

func runFilterChain(ctx context.Context, fc FilterChain, resp http.ResponseWriter, req *http.Request) {
    nextCtx := ctx
    for _, f := range fc.filters {
        log.Println("filtering", f.Name())
        nextCtx = f.Filter(nextCtx, resp, req)
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
