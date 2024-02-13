package proxy

import (
    "context"
)

// Used for tracking in context for completion of lifecycle
const (
    LIFECYCLE_MASK = "LIFECYCLE"
    AUTH_VAL = "AUTH"
)

// Can support up to 16 lifecycle stages
// If this changes be careful that bitmask still operates
type LifecycleMask uint16
const (
    Auth LifecycleMask = 1 << iota
    BalanceCheck
    RateLimit
)
type Lifecycle struct {
    mask LifecycleMask
}

// TODO add additional required fields
func (l Lifecycle) checkComplete() bool {
    // Unused or optional are masked out
    unused := ^LifecycleMask(7) // lowest bits on
    complete := (l.mask | unused) == ^LifecycleMask(0)
    return complete
}

func (l Lifecycle) UpdateContext(ctx context.Context) (context.Context, error) {
    return context.WithValue(ctx, LIFECYCLE_MASK, l), nil
}

func lifecycleFromContext(ctx context.Context) Lifecycle {
    var lifecycle Lifecycle
    value := ctx.Value(LIFECYCLE_MASK)
    if value != nil {
        lifecycle = value.(Lifecycle)
    } else {
        lifecycle = Lifecycle{}
    }
    return lifecycle
}

func SetStageComplete(ctx context.Context, stages LifecycleMask) Lifecycle {
    lifecycle := lifecycleFromContext(ctx)
    lifecycle.mask |= stages
    return lifecycle
}
