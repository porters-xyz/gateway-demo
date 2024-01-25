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
type Filter interface {
    Plugin
    Key() string // unique across all plugins loaded
    Filter(context.Context, http.ResponseWriter, *http.Request) context.Context
}

// Processors run in parallel and don't impact the request in any way
// e.g. Gather metrics on requests that don't impact response
type Processor interface {
    Plugin
    Key() string
    Process(context.Context, http.ResponseWriter, *http.Request)
}

// Limiter is a type of Filter that tracks relays and may block
type Limiter interface {
    Filter
    // TODO Parent/child stuff
}

type FilterChain struct {
    filters []Filter
    // TODO add other attributes as needed
}

func (fc FilterChain) Init(filters []Filter) FilterChain {
    fc.filters = filters
    return fc
}

type ProcessorSet struct {
    procs []Processor
}

func (ps ProcessorSet) Init(procs []Processor) ProcessorSet {
    ps.procs = procs
    return ps
}
