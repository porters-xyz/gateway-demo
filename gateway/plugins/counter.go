package plugins

import (
    "log"
    "net/http"
    "porters/db"
    "strconv"
)

type Counter struct {}

func (c Counter) Load() {
    log.Println("loading " + c.Name())
}

func (c Counter) Name() string {
    return "Request Counter"
}

func (c Counter) Key() string {
    return "COUNTER"
}

// Just count all requests
// and add header for now
// TODO make this asynchronous and remove header set
func (c Counter) HandleResponse(resp *http.Response) error {
    newCount := db.IncrCounter(resp.Request.Context(), c.Key())
    log.Println("count", strconv.FormatInt(newCount, 10))
    resp.Header.Set("X-Counter", strconv.FormatInt(newCount, 10))
    return nil
}
