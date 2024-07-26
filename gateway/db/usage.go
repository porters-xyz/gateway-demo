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
	tenant     *Tenant
	product    *Product
}

func NewUsageUpdater(ctx context.Context, status string) *UsageUpdater {
	updater := &UsageUpdater{
		status: status,
	}

	log.Info("usage.go > NewUsageUpdater > Attempting to read product from context")
	entity, ok := common.FromContext(ctx, PRODUCT)
	if !ok || entity == nil {
		log.Error("usage.go > NewUsageUpdater > Failed to get product from context")
	} else {
		updater.product = entity.(*Product)
		log.Info("usage.go > NewUsageUpdater > retrieved product entity", "product", updater.product)
	}

	logContext(ctx)
	log.Info("usage.go > NewUsageUpdater > Attempting to read app from context")
	entity, ok = common.FromContext(ctx, APP)
	if !ok || entity == nil {
		log.Error("usage.go > NewUsageUpdater > Failed to get app from context")
	} else {
		updater.app = entity.(*App)
		log.Info("usage.go > NewUsageUpdater > retrieved app entity", "app", updater.app)
	}

	// Ensure app is not nil before accessing Tenant
	if updater.app == nil {
		log.Error("usage.go > NewUsageUpdater > app is nil")
		return updater
	}

	// Ensure Tenant is loaded in context only if app is not nil
	if updater.app.Tenant.Id != "" { // Check if Tenant Id is not empty to ensure it's initialized
		log.Info("usage.go > NewUsageUpdater > Begin Tenant Lookup for tenant with id", "tenantId", updater.app.Tenant.Id)
		updater.app.Tenant.Lookup(ctx)
		log.Info("usage.go > NewUsageUpdater > Finished Tenant Lookup for tenant with id", "tenantId", updater.app.Tenant.Id)
	} else {
		log.Error("usage.go > NewUsageUpdater > app.Tenant is not initialized", "appId", updater.app.Id)
	}

	// Ensure tenant is retrieved from context
	if updater.app.Tenant.Id != "" {
		entity, ok = common.FromContext(ctx, TENANT)
		if !ok || entity == nil {
			log.Error("usage.go > NewUsageUpdater > Failed to get tenant from context", "tenantId", updater.app.Tenant.Id, "appId", updater.app.Id, "product", updater.product)
		} else {
			tenant := entity.(*Tenant)
			log.Info("usage.go > retrieved tenant entity", "tenant", tenant)
			updater.balancekey = fmt.Sprintf("BALANCE:%s", tenant.Id)
			updater.tenant = tenant
		}
	} else {
		log.Error("usage.go > NewUsageUpdater > app.Tenant is not properly initialized", "appId", updater.app.Id)
	}

	return updater
}

func logContext(ctx context.Context) {
	for k, v := range ctx.Value().(map[string]interface{}) {
		log.Info("context value", "key", k, "value", v)
	}
}

func (u *UsageUpdater) Run() {
	if u.app == nil || u.tenant == nil || u.product == nil {
		log.Error("usage.go > UsageUpdated > Invalid request, usage not reported", "app", u.app, "tenant", u.tenant, "product", u.product)
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
