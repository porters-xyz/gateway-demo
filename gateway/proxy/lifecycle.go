package proxy

import (
    "context"

    "porters/common"
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
    AccountLookup
    BalanceCheck
    RateLimit
)
type Lifecycle struct {
    mask LifecycleMask
}

func (l *Lifecycle) checkComplete() bool {
    // Unused or optional are masked out
    unused := ^LifecycleMask(Auth | AccountLookup | BalanceCheck | RateLimit) // lowest bits on
    complete := (l.mask | unused) == ^LifecycleMask(0)
    return complete
}

func (l *Lifecycle) ContextKey() string {
    return LIFECYCLE_MASK
}

func SetStageComplete(ctx context.Context, stages LifecycleMask) *Lifecycle {
    lifecycle := lifecycleFromContext(ctx)
    lifecycle.mask |= stages
    return lifecycle
}

func lifecycleFromContext(ctx context.Context) *Lifecycle {
    entity, ok := common.FromContext(ctx, LIFECYCLE_MASK)
    if !ok {
        // Empty lifecyle if missing
        return &Lifecycle{}
    }
    return entity.(*Lifecycle)
}
