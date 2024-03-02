package plugins

import (
    "log"
)

// Plugins that don't implement pre or post handler exist outside of request
// lifecycle
type Noop struct {}

func (n Noop) Load() {
    log.Println("loading " + n.Name())
}

func (n Noop) Name() string {
    return "noop"
}

func (n Noop) Key() string {
    return "NOOP"
}
