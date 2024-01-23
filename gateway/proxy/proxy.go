package proxy

import (
    "context"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
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

            // TODO structure this in a reasonable way
            blockingPrehandlers(ctx, resp, req)

            // TODO meant to track incoming requests without slowing things down, read-only
            nonBlockingPrehandlers(ctx, resp, req)

            // TODO any ctx adjustments
            proxy.ServeHTTP(resp, req)

            // TODO is this needed? after serving blocking may be dumb
            blockingPosthandlers(ctx, resp, req)

            // TODO any longer tasks that should spawn after handling request
            nonBlockingPosthandlers(ctx, resp, req)
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


func blockingPrehandlers(ctx context.Context, resp http.ResponseWriter, req *http.Request) {
    plugins := GetRegistry().elements
    for i:=0; i<len(plugins); i++ {
        filter, ok := plugins[i].(Filter)
        if ok {
            filter.Filter(ctx, resp, req)
        }
    }
    // TODO check rate limiter
}

func nonBlockingPrehandlers(ctx context.Context, resp http.ResponseWriter, req *http.Request) {
    // TODO increment requested for API key + account
}

func blockingPosthandlers(ctx context.Context, resp http.ResponseWriter, req *http.Request) {

}

func nonBlockingPosthandlers(ctx context.Context, resp http.ResponseWriter, req *http.Request) {
    // TODO increment success or fail numbers
}
