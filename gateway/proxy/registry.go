package proxy

// Registry to register external modules, for now contain all stages here
// Uses singleton so different parts of the lifecycle have access to plugins

import (
	"errors"
	log "log/slog"
	"sync"
)

type registry struct {
	plugins []Plugin
	keySet  map[string]Plugin
}

var pluginRegistry *registry = nil
var registryMutex sync.Once

func GetRegistry() *registry {
	registryMutex.Do(func() {
		pluginRegistry = &registry{
			plugins: make([]Plugin, 0),
			keySet:  make(map[string]Plugin),
		}
	})
	return pluginRegistry
}

func Register(plugin Plugin) {
	_ = GetRegistry() // init singleton
	err := avoidCollision(plugin)
	if err != nil {
		log.Error("unable to load plugin", "plugin", plugin.Name(), "err", err.Error())
		return
	}
	plugin.Load()

	pluginRegistry.plugins = append(pluginRegistry.plugins, plugin)
	log.Info("Registered plugin successfully", "plugin", plugin.Name())
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
