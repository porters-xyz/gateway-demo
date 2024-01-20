package proxy

import (
    "context"
    "log"
    "net/url"
    "net/http"
    "net/http/httputil"
)

type Filter interface {
    Plugin
    Filter(http.ResponseWriter, *http.Request)
}

func Start() {
    // TODO grab url for gateway kit
    remote, err := url.Parse("http://localhost:9999")
    if err != nil {
        log.Println(err)
    }

    handler := func(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
        return func(resp http.ResponseWriter, req *http.Request) {
            log.Println(req.URL)
            req.Host = remote.Host

            // TODO structure this in a reasonable way
            blockingPrehandlers(resp, req)

            // TODO meant to track incoming requests without slowing things down, read-only
            nonBlockingPrehandlers(resp, req)

            proxy.ServeHTTP(resp, req)

            // TODO is this needed? after serving blocking may be dumb
            blockingPosthandlers(resp, req)

            // TODO any longer tasks that should spawn after handling request
            nonBlockingPosthandlers(resp, req)
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

// TODO allow for scripting headers, or configuration
// TODO move this to pluggable prehandler
func setHeaders(req *http.Request) {
    req.Header.Set("X-Foo", "header-stuff")
}

func blockingPrehandlers(resp http.ResponseWriter, req *http.Request) {
    setupContext(req)
    setHeaders(req)
    // TODO check rate limiter
}

func nonBlockingPrehandlers(resp http.ResponseWriter, req *http.Request) {
    // TODO increment requested for API key + account
}

func blockingPosthandlers(resp http.ResponseWriter, req *http.Request) {

}

func nonBlockingPosthandlers(resp http.ResponseWriter, req *http.Request) {
    // TODO increment success or fail numbers
}
