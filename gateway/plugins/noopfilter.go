package plugins

import (
    "log"
    "net/http"
    "porters/proxy"
)

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

func (n NoopFilter) HandleRequest(req *http.Request) {
    log.Println(req)
    lifecycle := proxy.SetStageComplete(req.Context(), n.LifecycleStage)
    *req = *req.WithContext(lifecycle.UpdateContext(req.Context()))
    log.Println(req)
}
