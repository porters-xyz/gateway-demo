package proxy

import (
    "context"
    "net/http"
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

func setupContext(req *http.Request) {
    // TODO read ctx from request and make any modifications
    ctx := req.Context()
    lifecyclectx := UpdateContext(ctx, &Lifecycle{})
    *req = *req.WithContext(lifecyclectx)
}
