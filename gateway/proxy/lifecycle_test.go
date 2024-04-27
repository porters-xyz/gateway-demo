package proxy

import (
    "context"
    "testing"
)

func TestMask(t *testing.T) {
    want := LifecycleMask(13)
    ctx := context.Background()
    lifecycle := SetStageComplete(ctx, Auth)
    ctx = UpdateContext(ctx, lifecycle)
    lifecycle = SetStageComplete(ctx, BalanceCheck)
    ctx = UpdateContext(ctx, lifecycle)
    lifecycle = SetStageComplete(ctx, RateLimit)
    if want != lifecycle.mask {
        t.Fatalf(`want %d got %d`, want, lifecycle.mask)
    }
}
