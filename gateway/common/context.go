package common

import (
    "context"
    "time"
)

const (
    INSTRUMENT string = "INSTRUMENT_START"
)

type Contextable interface {
    ContextKey() string
}

type Instrument struct {
    Timestamp time.Time
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

func StartInstrument() *Instrument {
    return &Instrument{
        Timestamp: time.Now(),
    }
}

func (i *Instrument) ContextKey() string {
    return INSTRUMENT
}
