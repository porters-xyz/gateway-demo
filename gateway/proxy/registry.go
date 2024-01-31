package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
    "sync"
)

type registry struct {
    preFilters []Filter
    postFilters []Filter
    preProcessors []Processor
    postProcessors []Processor
}

type PreOrPost int
const (
    PRE PreOrPost = iota
    POST
)

var r *registry = nil
var registryMutex sync.Once

func Register(p Plugin, stage PreOrPost) {
    _ = GetRegistry() // init singleton
    p.Load()

    filter, ok := p.(Filter)
    if ok {
        switch stage {
        case PRE:
            r.preFilters = append(r.preFilters, filter)
        case POST:
            r.postFilters = append(r.postFilters, filter)
        }
    }

    processor, ok := p.(Processor)
    if ok {
        switch stage {
        case PRE:
            r.preProcessors = append(r.preProcessors, processor)
        case POST:
            r.postProcessors = append(r.postProcessors, processor)
        }
    }
}

func GetRegistry() *registry {
    registryMutex.Do(func() {
        r = &registry{
            preFilters: make([]Filter, 0),
            postFilters: make([]Filter, 0),
            preProcessors: make([]Processor, 0),
            postProcessors: make([]Processor, 0),
        }
    })
    return r
}

func (r registry) GetFilterChain(stage PreOrPost) FilterChain {
    var chain FilterChain
    switch stage {
    case PRE:
        chain = FilterChain{}.Init(r.preFilters)
    case POST:
        chain = FilterChain{}.Init(r.postFilters)
    }
    return chain
}

func (r registry) GetProcessorSet(stage PreOrPost) ProcessorSet {
    var set ProcessorSet
    switch stage {
    case PRE:
        set = ProcessorSet{}.Init(r.preProcessors)
    case POST:
        set = ProcessorSet{}.Init(r.postProcessors)
    }
    return set

}
