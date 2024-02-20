package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
    "errors"
    "log"
    "sync"
)

type registry struct {
    preFilters []PreFilter
    postFilters []PostFilter
    preProcessors []PreProcessor
    postProcessors []PostProcessor
    keySet map[string]Plugin
}

var pluginRegistry *registry = nil
var registryMutex sync.Once

func GetRegistry() *registry {
    registryMutex.Do(func() {
        pluginRegistry = &registry{
            preFilters: make([]PreFilter, 0),
            postFilters: make([]PostFilter, 0),
            preProcessors: make([]PreProcessor, 0),
            postProcessors: make([]PostProcessor, 0),
            keySet: make(map[string]Plugin),
        }
    })
    return pluginRegistry
}

func Register(plugin Plugin) {
    _ = GetRegistry() // init singleton
    err := avoidCollision(plugin)
    if err != nil {
        log.Println("unable to load plugin", plugin.Name(), "due to", err.Error())
        return
    }
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

func avoidCollision(plugin Plugin) error {
    _ = GetRegistry() // just to make sure
    key := plugin.Key()
    if pluginRegistry.keySet[key] != nil {
        return errors.New("another plugin uses same key")
    }
    pluginRegistry.keySet[key] = plugin
    return nil
}
