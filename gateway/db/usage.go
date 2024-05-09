package db

import (
    "context"
    "fmt"

    "porters/common"
)

// Implements Runnable
type UsageUpdater struct {
    status string
    balancekey string
    app *App
    tenant *Tenant
    product *Product
}

func NewUsageUpdater(ctx context.Context, status string) *UsageUpdater {
    updater := &UsageUpdater{
        status: status,
    }

    entity, ok := common.FromContext(ctx, PRODUCT)
    if ok {
        updater.product = entity.(*Product)
    }
    entity, ok = common.FromContext(ctx, APP)
    if ok {
        updater.app = entity.(*App)
    }
    entity, ok = common.FromContext(ctx, TENANT)
    if ok {
        tenant := entity.(*Tenant)
        updater.balancekey = fmt.Sprintf("BALANCE:%s", tenant.Id)
        updater.tenant = tenant
    }

    return updater
}

func (u *UsageUpdater) Run() {
    if u.status == "success" {
        ctx := context.Background()
        DecrementCounter(ctx, u.balancekey, u.product.Weight)

        use := &Relaytx{
            AppId: u.app.Id,
            ProductName: u.product.Name,
        }
        IncrementCounter(ctx, use.Key(), u.product.Weight)
    }
    common.EndpointUsage.WithLabelValues(u.app.HashId(), u.app.Tenant.Id, u.product.Name, u.status).Inc()
}

func (u *UsageUpdater) Error() string {
    return fmt.Sprintf("BAL: unable to use relays for %s", u.tenant.Id)
}
