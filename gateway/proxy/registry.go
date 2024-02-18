package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
    "log"
    "sync"
)

type registry struct {
    preFilters []PreFilter
    postFilters []PostFilter
    preProcessors []PreProcessor
    postProcessors []PostProcessor
}

var pluginRegistry *registry = nil
var registryMutex sync.Once

func Register(plugin Plugin) {
    _ = GetRegistry() // init singleton
    plugin.Load()

    switch p := plugin.(type) {
    case PreFilter:
	pluginRegistry.preFilters = append(pluginRegistry.preFilters, p)
    case PostFilter:
	pluginRegistry.postFilters = append(pluginRegistry.postFilters, p)
    case PreProcessor:
	pluginRegistry.preProcessors = append(pluginRegistry.preProcessors, p)
    case PostProcessor:
	pluginRegistry.postProcessors = append(pluginRegistry.postProcessors, p)
    default:
	log.Println("could not determine plugin type")
    }
}

func GetRegistry() *registry {
    registryMutex.Do(func() {
        pluginRegistry = &registry{
            preFilters: make([]PreFilter, 0),
            postFilters: make([]PostFilter, 0),
            preProcessors: make([]PreProcessor, 0),
            postProcessors: make([]PostProcessor, 0),
        }
    })
    return pluginRegistry
}
