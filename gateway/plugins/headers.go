package plugins

import (
    "fmt"
    "net/http"
)

type Headers struct {}

func (h Headers) Load() {
    fmt.Println("loading " + h.Name())
}

func (h Headers) Name() string {
    return "HEADERS"
}

// Just count all requests
// and add header for now
func (h Headers) Filter(resp http.ResponseWriter, req *http.Request) {
    req.Header.Set("X-Foo", "header-stuff")
}
