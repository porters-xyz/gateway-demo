package plugins

import (
    "log"
    "net/http"
    "strconv"

    "porters/db"
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

func (c Counter) Field() string {
    return "requests"
}

// Just count all requests
// and add header for now
// TODO make this asynchronous and remove header set
func (c Counter) HandleResponse(resp *http.Response) error {
    newCount := db.IncrementCounter(resp.Request.Context(), c.Key(), 1)
    log.Println("count", newCount)
    resp.Header.Set("X-Counter", strconv.Itoa(newCount))
    return nil
}
