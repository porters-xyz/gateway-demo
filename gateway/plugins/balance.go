package plugins

// This is the top level bucket where available relays are sync'ed with balance

import (
	"context"
	"fmt"
	log "log/slog"
	"net/http"

	"porters/common"
	"porters/db"
	"porters/proxy"
)

type BalanceTracker struct {
}

type balancecache struct {
	tracker       *BalanceTracker
	tenant        *db.Tenant
	app           *db.App
	product       *db.Product
	cachedBalance int
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
	log.Debug("Loading plugin", "plugin", b.Name())
}

// TODO optim: script this to avoid multi-hops
func (b *BalanceTracker) HandleRequest(req *http.Request) error {
	ctx := req.Context()
	appId := proxy.PluckAppId(req)
	app := &db.App{Id: appId}
	ctx, err := app.Lookup(ctx)
	if err != nil {
		return proxy.NewHTTPError(http.StatusNotFound)
	}
	bal := &balancecache{
		tracker: b,
		tenant:  &app.Tenant,
	}
	err = bal.Lookup(ctx)
	if err != nil {
		return proxy.NewHTTPError(http.StatusNotFound)
	}
	ctx = common.UpdateContext(ctx, bal)
	ctx = common.UpdateContext(ctx, app)
	// TODO Check that balance is greater than or equal to req weight

	if bal.cachedBalance > 0 {
		lifecycle := proxy.SetStageComplete(ctx, proxy.BalanceCheck|proxy.AccountLookup)
		ctx = common.UpdateContext(ctx, lifecycle)
	} else {
		log.Error("no balance remaining", "app", app.HashId())
		return proxy.BalanceExceededError
	}

	*req = *req.WithContext(ctx)

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
