package common

import (
	"context"
	log "log/slog"
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
	log.Debug("Updating context", "key", entity.ContextKey(), "entity", entity)
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

// Leaving here for debugging purposes
func LogContext(ctx context.Context, contextkey string) {
	log.Debug("Context Value for", "key", contextkey, "val", ctx.Value(contextkey))
}

func StartInstrument() *Instrument {
	return &Instrument{
		Timestamp: time.Now(),
	}
}

func (i *Instrument) ContextKey() string {
	return INSTRUMENT
}
