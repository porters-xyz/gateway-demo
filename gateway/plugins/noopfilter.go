package plugins

import (
    "log"
    "net/http"

    "porters/common"
    "porters/proxy"
)

// This can be used to trigger lifecycle stages without performing any task
type NoopFilter struct {
    LifecycleStage proxy.LifecycleMask
}

func (n NoopFilter) Load() {
    log.Println("loading " + n.Name())
}

func (n NoopFilter) Name() string {
    return "noopfilter"
}

func (n NoopFilter) Key() string {
    return "NOOP_FILTER"
}

func (n NoopFilter) HandleRequest(req *http.Request) error {
    lifecycle := proxy.SetStageComplete(req.Context(), n.LifecycleStage)
    *req = *req.WithContext(common.UpdateContext(req.Context(), lifecycle))
    return nil
}
