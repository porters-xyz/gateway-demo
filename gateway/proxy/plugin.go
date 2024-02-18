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

// Filters run consecutively and modify the input, output, or context
type PreFilter interface {
    Plugin
    Key() string
    PreFilter(context.Context, http.ResponseWriter, *http.Request) (context.Context, error)
}

type PostFilter interface {
    Plugin
    Key() string
    PostFilter(context.Context, http.ResponseWriter, *http.Request) (context.Context, error)
}

// Processors run in parallel and don't impact the request in any way
// e.g. Gather metrics on requests that don't impact response
type PreProcessor interface {
    Plugin
    Key() string
    PreProcess(context.Context, http.ResponseWriter, *http.Request) error
}

type PostProcessor interface {
    Plugin
    Key() string
    PostProcess(context.Context, http.ResponseWriter, *http.Request) error
}
