package common

import (
    "context"
)

type Contextable interface {
    ContextKey() string
}

func UpdateContext(ctx context.Context, entity Contextable) context.Context {
    return context.WithValue(ctx, entity.ContextKey(), entity)
}

func FromContext(ctx context.Context, contextkey string) (any, bool) {
    value := ctx.Value(contextkey)
    if value != nil {
        return value, true
    } else {
        return nil, false
    }
}
