package plugins

import (
    "context"
    "fmt"
    "net/http"
    "porters/proxy"
)

type NoopFilter struct {
    LifecycleStage proxy.LifecycleMask
}

func (n NoopFilter) Load() {
    fmt.Println("loading " + n.Name())
}

func (n NoopFilter) Name() string {
    return "noopfilter"
}

func (n NoopFilter) Key() string {
    return "NOOP_FILTER"
}

func (n NoopFilter) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) (context.Context, error) {
    lifecycle := proxy.SetStageComplete(ctx, n.LifecycleStage)
    return lifecycle.UpdateContext(ctx)
}
