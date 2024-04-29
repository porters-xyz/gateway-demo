package proxy

// Defines interfaces required to implement plugins for the proxy
// Currently includes:
//   - Filter: inserted in the execution flow to read/write from http req/resp
//   - Limiter: checks a precondition and allows or rejects proxy forwarding

import (
    "net/http"
)

type Plugin interface {
    Name() string // used for human readability
    Key() string
    Load()
}

// Prehandlers run in order and can modify the request, or run process based on
// it
// Implementation should put any state needed between handlers into context of
// request
// returns error if request is denied
type PreHandler interface {
    Plugin
    HandleRequest(*http.Request) error
}

// Posthandlers run in order and can modify the response, or run process based
// on the response
// Implementation should handle context through Response.Request
type PostHandler interface {
    Plugin
    HandleResponse(*http.Response) error
}
