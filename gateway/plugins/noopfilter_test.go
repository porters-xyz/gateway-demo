package plugins

import (
    "log"
    "reflect"
    "testing"
    "porters/proxy"
)

// Wrote this when I was diagnosing interface issues
func TestImplementsPreHandler(t *testing.T) {
    p := NoopFilter{}
    preHandlerType := reflect.TypeOf((*proxy.PreHandler)(nil)).Elem()
    ok := reflect.TypeOf(p).Implements(preHandlerType)
    if !ok {
        t.Fatal("not properly casting to sub interface")
    }
}
