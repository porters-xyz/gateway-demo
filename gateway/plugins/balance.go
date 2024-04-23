package plugins

// This is the top level bucket where available relays are sync'ed with balance

import (
    "context"
    "fmt"
    "log"
    "net/http"

    "porters/db"
    "porters/proxy"
)

type BalanceTracker struct {
}

type balancecache struct {
    tracker *BalanceTracker
    tenant *db.Tenant
    cachedBalance int
}

func (b *BalanceTracker) Name() string {
    return "Relay Balance Limiter"
}

func (b *BalanceTracker) Key() string {
    return "BALANCE"
}

func (b *BalanceTracker) Load() {
    // Setup any plugin state
    log.Println("Loading", b.Name())
}

// TODO optim: script this to avoid multi-hops
func (b *BalanceTracker) HandleRequest(req *http.Request) {
    ctx := req.Context()
    appId := proxy.PluckAppId(req)
    app := &db.App{Id: appId}
    err := app.Lookup(ctx)
    log.Println("app:", app)
    if err != nil {
        // TODO can't find app
    }
    bal := &balancecache{
        tracker: b,
        tenant: &app.Tenant,
    }
    err = bal.Lookup(ctx)
    if err != nil {
        // TODO can we recover from this?
    }
    ctx = context.WithValue(ctx, b.Key(), bal)
    // TODO Check that balance is greater than or equal to req weight
    if bal.cachedBalance > 0 {
        log.Println("balance remaining")
        lifecycle := proxy.SetStageComplete(ctx, proxy.BalanceCheck)
        ctx = lifecycle.UpdateContext(ctx)
    } else {
        log.Println("none remaining", appId)
        var cancel context.CancelCauseFunc
        ctx, cancel = context.WithCancelCause(ctx)
        err := proxy.BalanceExceededError
        cancel(err)
    }
    *req = *req.WithContext(ctx)
}

func (b *BalanceTracker) HandleResponse(resp *http.Response) error {
    // TODO read pokt docs for if there is better way to check response
    ctx := resp.Request.Context()
    if resp.StatusCode < 400 {
        bal := b.getFromContext(ctx)
        newval := db.DecrementCounter(ctx, bal.Key(), 1)
        log.Println("balance is now:", newval)
    }
    // TODO >= 400 need to return error?
    // TODO log usage in correct way (for analytics)
    return nil
}

func (b *BalanceTracker) getFromContext(ctx context.Context) *balancecache {
    var bal *balancecache
    value := ctx.Value(b.Key())
    if value != nil {
        bal = value.(*balancecache)
    } else {
        // TODO see if we can lookup from app or tenant
    }
    return bal
}

func (c *balancecache) Key() string {
    return fmt.Sprintf("%s:%s", c.tracker.Key(), c.tenant.Id)
}

func (c *balancecache) Lookup(ctx context.Context) error {
    created, err := db.InitCounter(ctx, c.Key(), c.tenant.Balance)
    if err != nil {
        return err
    }
    if created {
        c.cachedBalance = c.tenant.Balance
    } else {
        c.cachedBalance = db.GetIntVal(ctx, c.Key())
    }
    return nil
}
