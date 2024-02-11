package proxy

import (
    "context"
)

// Used for tracking in context for completion of lifecycle
const LIFECYCLE = "lifecycle"

type Lifecycle struct {
    Authentication bool
    Authorization bool
    RateLimit bool
}

// TODO add additional required fields
func (l Lifecycle) checkComplete() bool {
    complete := l.Authentication && l.Authorization && l.RateLimit
    return complete
}

func fromContext(ctx context.Context) Lifecycle {
    var lifecycle Lifecycle
    value := ctx.Value(LIFECYCLE)
    if value != nil {
        lifecycle = value.(Lifecycle)
    } else {
        lifecycle = Lifecycle{}
    }
    return lifecycle
}

func SetAuthComplete(ctx context.Context) Lifecycle {
    lifecycle := fromContext(ctx)
    lifecycle.Authentication = true
    return lifecycle
}

func SetRateLimitComplete(ctx context.Context) Lifecycle {
    lifecycle := fromContext(ctx)
    lifecycle.RateLimit = true
    return lifecycle
}
