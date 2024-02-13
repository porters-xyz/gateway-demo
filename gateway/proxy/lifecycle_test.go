package proxy

import (
    "context"
    "testing"
)

func TestMask(t *testing.T) {
    want := LifecycleMask(7)
    ctx := context.Background()
    lifecycle := SetStageComplete(ctx, Auth)
    ctx, _ = lifecycle.UpdateContext(ctx)
    lifecycle = SetStageComplete(ctx, BalanceCheck)
    ctx, _ = lifecycle.UpdateContext(ctx)
    lifecycle = SetStageComplete(ctx, RateLimit)
    if want != lifecycle.mask {
        t.Fatalf(`want %d got %d`, want, lifecycle.mask)
    }
}
