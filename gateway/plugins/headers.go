package plugins

import (
    "context"
    "fmt"
    "net/http"
)

type Headers struct {
}

func (h Headers) Load() {
    fmt.Println("loading " + h.Name())
}

func (h Headers) Name() string {
    return "HEADERS"
}

// Just count all requests
// and add header for now
func (h Headers) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) context.Context {
    req.Header.Set("X-Foo", "header-stuff")
    return ctx
}
