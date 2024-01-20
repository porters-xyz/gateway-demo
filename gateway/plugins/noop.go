package plugins

import (
    "fmt"
)

type Noop struct {}

func (n Noop) Load() {
    fmt.Println("loading " + n.Name())
}

func (n Noop) Name() string {
    return "noop"
}
