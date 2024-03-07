package plugins

// This is the top level bucket where available relays are sync'ed with balance

import (
    "context"
    "log"
    "net/http"

    "github.com/gorilla/mux"

    "porters/db"
    "porters/proxy"
)

type BalanceTracker struct {
}

func (q *BalanceTracker) Name() string {
    return "Relay Balance Limiter"
}

func (q *BalanceTracker) Key() string {
    return "BALANCE"
}

func (q *BalanceTracker) Load() {
    // Setup any plugin state
}

// TODO check request against available relays
// TODO set headers if needing to block
// TODO update context to reflect
// TODO script this to avoid multi-hops
func (q *BalanceTracker) PreHandler(req *http.Request) {
    ctx := req.Context()
    path := mux.Vars(req)[proxy.APP_PATH]
    tmpapp := db.NewApp(path)
    app := &tmpapp
    app.Lookup(ctx)
    if app.Tenant.CachedBalance > 0 {
        log.Println("balance remaining")
        lifecycle := proxy.SetStageComplete(ctx, proxy.BalanceCheck)
        ctx = lifecycle.UpdateContext(ctx)
        *req = *req.WithContext(ctx)
    } else {
        log.Println("none remaining", path)
        ctx, cancel := context.WithCancelCause(ctx)
        err := proxy.NewBalanceExceededError()
        *req = *req.WithContext(ctx)
        cancel(err)
    }
}

func (q *BalanceTracker) PostHandler(resp *http.Response) error {
    // TODO check response for success
    //code := resp.
    // TODO update usage count
    // TODO log properly
    return nil
}
