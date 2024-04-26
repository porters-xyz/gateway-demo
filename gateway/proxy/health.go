package proxy

import (
    "io"
    "net/http"

    "porters/db"
)

// TODO other healthchecks should be added

func healthHandler(resp http.ResponseWriter, req *http.Request) {
    hc := (&db.Cache{}).Healthcheck()
    resp.Header().Set("Content-Type", "application/json")
    io.WriteString(resp, hc.ToJson())
}
