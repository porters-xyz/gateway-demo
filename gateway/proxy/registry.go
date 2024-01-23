package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
    "sync"
)

type registry struct {
    name string
    elements []Plugin
}

var r *registry = nil
var registryMutex sync.Once

func Register(p Plugin) {
    _ = GetRegistry() // init singleton
    p.Load()
    r.elements = append(r.elements, p)
}

func GetRegistry() *registry {
    registryMutex.Do(func() {
        r = &registry{
            name: "main",
            elements: make([]Plugin, 0),
        }
    })
    return r
}
