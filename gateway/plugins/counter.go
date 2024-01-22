package plugins

import (
    "fmt"
    "net/http"
    "porters/proxy"
    "strconv"
)

type Counter struct {}

func (c Counter) Load() {
    fmt.Println("loading " + c.Name())
}

func (c Counter) Name() string {
    return "COUNTER"
}

// Just count all requests
// and add header for now
func (c Counter) Filter(resp http.ResponseWriter, req *http.Request) {
    ctx := req.Context()
    newCount := proxy.IncCounter(ctx, c.Name())
    fmt.Println("count " + strconv.FormatInt(newCount, 10))
    resp.Header().Set("X-Counter", strconv.FormatInt(newCount, 10))
}
