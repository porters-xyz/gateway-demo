package proxy

import (
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
        return func(writer http.ResponseWriter, req *http.Request) {
            log.Println(req.URL)
            req.Host = remote.Host
            setHeaders(req)
            proxy.ServeHTTP(writer, req)
        }
    }

    revProxy := httputil.NewSingleHostReverseProxy(remote)
    http.HandleFunc("/", handler(revProxy))
    err2 := http.ListenAndServe(":9000", nil)
    if err2 != nil {
        panic(err2)
    }
}

// TODO allow for scripting headers, or configuration
func setHeaders(req *http.Request) {
    req.Header.Set("X-Foo", "header-stuff")
}
