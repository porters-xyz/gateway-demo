package plugins

// This is the top level bucket where available relays are sync'ed with balance

import (
    "context"
    "fmt"
    "log"
    "net/http"

    "porters/common"
    "porters/db"
    "porters/proxy"
    "porters/utils"
)

type BalanceTracker struct {
}

type balancecache struct {
    tracker *BalanceTracker
    tenant *db.Tenant
    app *db.App
    product *db.Product
    cachedBalance int
}

type usageUpdater struct {
    status string
    bal *balancecache
    app *db.App
    product *db.Product
}

const (
    BALANCE string = "BALANCE"
)

func (b *BalanceTracker) Name() string {
    return "Relay Balance Limiter"
}

func (b *BalanceTracker) Key() string {
    return BALANCE
}

func (b *BalanceTracker) Load() {
    // Setup any plugin state
    log.Println("Loading", b.Name())
}

// TODO optim: script this to avoid multi-hops
func (b *BalanceTracker) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    appId := proxy.PluckAppId(req)
    app := &db.App{Id: appId}
    err := app.Lookup(ctx)
    log.Println("app:", app)
    if err != nil {
        return proxy.NewHTTPError(http.StatusNotFound)
    }
    bal := &balancecache{
        tracker: b,
        tenant: &app.Tenant,
    }
    err = bal.Lookup(ctx)
    if err != nil {
        return proxy.NewHTTPError(http.StatusNotFound)
    }
    ctx = common.UpdateContext(ctx, bal)
    ctx = common.UpdateContext(ctx, app)
    // TODO Check that balance is greater than or equal to req weight
    if bal.cachedBalance > 0 {
        log.Println("balance remaining")
        lifecycle := proxy.SetStageComplete(ctx, proxy.BalanceCheck)
        ctx = common.UpdateContext(ctx, lifecycle)
        *req = *req.WithContext(ctx)
    } else {
        log.Println("none remaining", appId)
        return proxy.BalanceExceededError
    }
    return nil
}

func (b *BalanceTracker) HandleResponse(resp *http.Response) error {
    // TODO read pokt docs for if there is better way to check response
    ctx := resp.Request.Context()

    if resp.StatusCode < 400 {
        updater := newUsageUpdater(ctx, "success")
        common.GetTaskQueue().Tasks <- updater
    } else {
        updater := newUsageUpdater(ctx, "failure")
        common.GetTaskQueue().Tasks <- updater
    }
    // TODO >= 400 need to return error?
    // TODO log usage in correct way (for analytics)
    return nil
}

func (c *balancecache) Key() string {
    return fmt.Sprintf("%s:%s", c.tracker.Key(), c.tenant.Id)
}

func (c *balancecache) ContextKey() string {
    return BALANCE
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

func newUsageUpdater(ctx context.Context, status string) *usageUpdater {
    updater := &usageUpdater{
        status: status,
    }

    entity, ok := common.FromContext(ctx, BALANCE)
    if ok {
        updater.bal = entity.(*balancecache)
    }
    entity, ok = common.FromContext(ctx, db.PRODUCT)
    if ok {
        updater.product = entity.(*db.Product)
    }
    entity, ok = common.FromContext(ctx, db.APP)
    if ok {
        updater.app = entity.(*db.App)
    }

    return updater
}

func (u *usageUpdater) Run() {
    log.Println("updater", u)
    if u.status == "success" {
        ctx := context.Background()
        db.DecrementCounter(ctx, u.bal.Key(), u.product.Weight)

        use := &db.Relaytx{
            AppId: u.app.Id,
            ProductName: u.product.Name,
        }
        db.IncrementCounter(ctx, use.Key(), u.product.Weight)
    }
    hashedAppId := utils.Hash(u.app.Id)
    common.EndpointUsage.WithLabelValues(hashedAppId, u.product.Name, u.status).Inc()
}
