package plugins

// This is the top level bucket where available relays are sync'ed with balance

import (
    "context"
    "log"
    "net/http"
    "porters/db"
    "porters/proxy"
)

type Quota struct {
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
// Requires: AUTH upstream
func (q Quota) PreFilter(ctx context.Context, resp http.ResponseWriter, req *http.Request) (context.Context, error) {
    // TODO check relays left
    newCtx := ctx
    var err error

    // TODO move AUTH state to lifecycle
    valueKey := ctx.Value(proxy.AUTH_VAL)
    log.Println("no value here", valueKey)
    if valueKey != nil {
        key := valueKey.(string)
        quota := db.HasRelays(ctx, key)
        if quota {
            log.Println("quota remaining")
            lifecycle := proxy.SetStageComplete(ctx, proxy.BalanceCheck)
            newCtx = lifecycle.UpdateContext(ctx)
        } else {
            log.Println("none remaining", key, quota)
            err = proxy.NewBalanceExceededError()
        }
    }

    return newCtx, err
}

func (q Quota) PostProcessor(ctx context.Context, resp http.ResponseWriter, req *http.Request) error {
    // TODO check response for success
    //code := resp.
    // TODO update usage count
    // TODO log properly
    return nil
}
