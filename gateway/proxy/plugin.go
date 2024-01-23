package proxy

// Defines interfaces required to implement plugins for the proxy
// Currently includes:
//   - Filter: inserted in the execution flow to read/write from http req/resp
//   - Limiter: checks a precondition and allows or rejects proxy forwarding

import (
    "context"
    "net/http"
)

type Plugin interface {
    Name() string // used for human readability
    Load()
}

type Filter interface {
    Plugin
    Key() string // unique across all plugins loaded
    Filter(context.Context, http.ResponseWriter, *http.Request)
}

type Limiter interface {
    Filter
    // Ordering stuff
}
