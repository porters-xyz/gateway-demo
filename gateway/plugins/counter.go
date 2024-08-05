package plugins

import (
	log "log/slog"
	"net/http"

	"porters/db"
)

type Counter struct{}

func (c Counter) Load() {
	log.Debug("loading plugin", "plugin", c.Name())
}

func (c Counter) Name() string {
	return "Request Counter"
}

func (c Counter) Key() string {
	return "COUNTER"
}

func (c Counter) Field() string {
	return "requests"
}

// Just count all requests
func (c Counter) HandleResponse(resp *http.Response) error {
	newCount := db.IncrementCounterKey(resp.Request.Context(), c.Key(), 1)
	log.Debug("counting request", "count", newCount)
	return nil
}
