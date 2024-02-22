package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
    "errors"
    "log"
    "sync"
)

type registry struct {
    preHandlers []PreHandler
    postHandlers []PostHandler
    keySet map[string]Plugin
}

var pluginRegistry *registry = nil
var registryMutex sync.Once

func GetRegistry() *registry {
    registryMutex.Do(func() {
        pluginRegistry = &registry{
            preHandlers: make([]PreHandler, 0),
            postHandlers: make([]PostHandler, 0),
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
    case PreHandler:
		pluginRegistry.preHandlers = append(pluginRegistry.preHandlers, p)
    case PostHandler:
		pluginRegistry.postHandlers = append(pluginRegistry.postHandlers, p)
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
