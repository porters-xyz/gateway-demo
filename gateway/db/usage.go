package db

import (
	"context"
	"fmt"
	log "log/slog"

	"porters/common"
)

// Implements Runnable
type UsageUpdater struct {
	status     string
	balancekey string
	app        *App
	product    *Product
}

func NewUsageUpdater(ctx context.Context, status string) *UsageUpdater {
	updater := &UsageUpdater{
		status: status,
	}

	entity, ok := common.FromContext(ctx, PRODUCT)
	if !ok || entity == nil {
		log.Error("usage.go > NewUsageUpdater > Failed to get product from context")
	} else {
		updater.product = entity.(*Product)
	}

	entity, ok = common.FromContext(ctx, APP)
	if !ok || entity == nil {
		log.Error("usage.go > NewUsageUpdater > Failed to get app from context")
	} else {
		updater.app = entity.(*App)
		updater.balancekey = fmt.Sprintf("BALANCE:%s", updater.app.Tenant.Id)
	}

	return updater
}

func (u *UsageUpdater) Run() {
	if u.app == nil || u.product == nil {
		log.Error("usage.go > UsageUpdated > Invalid request, usage not reported", "app", u.app, "product", u.product)
		return
	}

	if u.status == "success" {
		ctx := context.Background()
		decCounter := DecrementCounter(ctx, u.balancekey, u.product.Weight)
		log.Info("usage.go > UsageUpdated > Decremented by ", "decCounter", decCounter, "app", u.app)

		use := &Relaytx{
			AppId:       u.app.Id,
			ProductName: u.product.Name,
		}

		incCounter := IncrementCounter(ctx, use.Key(), u.product.Weight)
		log.Info("usage.go > UsageUpdated > Incremented by ", "incCounter", incCounter, "app", u.app)
	}
	common.EndpointUsage.WithLabelValues(u.app.HashId(), u.app.Tenant.Id, u.product.Name, u.status).Inc()
}

func (u *UsageUpdater) Error() string {
	return fmt.Sprintf("BAL: unable to use relays for %s", u.app.Tenant.Id)
}
