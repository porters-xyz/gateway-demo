package plugins

import (
    "context"
    "fmt"
    "net/http"
    "porters/proxy"
)

type Blocker struct {}

func (b Blocker) Load() {
    fmt.Println("loading " + b.Name())
}

func (b Blocker) Name() string {
    return "blocker"
}

func (b Blocker) Key() string {
    return "BLOCKER"
}

func (b Blocker) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) (context.Context, error) {
    return ctx, &proxy.FilterBlockError{}
}
