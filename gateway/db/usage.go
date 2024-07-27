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

	log.Info("NewUsageUpdater Begin", "status", status)

	common.LogContext(ctx, PRODUCT)
	common.LogContext(ctx, APP)
	common.LogContext(ctx, TENANT)

	entity, ok := common.FromContext(ctx, PRODUCT)
	if !ok || entity == nil {
		log.Error("Failed to get product from context")
	} else {
		updater.product = entity.(*Product)
		log.Debug("Retrieved product entity", "product", updater.product)
	}

	entity, ok = common.FromContext(ctx, APP)
	if !ok || entity == nil {
		log.Error("Failed to get app from context")
	} else {
		updater.app = entity.(*App)
		log.Debug("Retrieved app entity", "app", updater.app)
	}

	// Ensure app is not nil before accessing Tenant
	if updater.app == nil {
		log.Error("usage.go > NewUsageUpdater > app is nil")
		return updater
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
		DecrementCounter(ctx, u.balancekey, u.product.Weight)

		use := &Relaytx{
			AppId:       u.app.Id,
			ProductName: u.product.Name,
		}
		IncrementCounter(ctx, use.Key(), u.product.Weight)
	}
	common.EndpointUsage.WithLabelValues(u.app.HashId(), u.app.Tenant.Id, u.product.Name, u.status).Inc()
}

func (u *UsageUpdater) Error() string {
	return fmt.Sprintf("BAL: unable to use relays for %s", u.app.Tenant.Id)
}
