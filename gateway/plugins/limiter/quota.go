package limiter

// This is the top level bucket where available relays are sync'ed with balance

import (
    "context"
    "net/http"
)

type Quota struct {
    Limiter
}

func (q Quota) Name() string {
    return "Relay Balance Limiter"
}

func (q Quota) Key() string {
    return "QUOTA"
}

func (q Quota) Load() {
    // Setup any plugin state
}

// TODO check request against available relays
// TODO set headers if needing to block
// TODO update context to reflect
func (q Quota) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) {

}
