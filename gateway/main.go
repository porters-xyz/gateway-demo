package main

import (
    "os"

    "porters/plugins"
    "porters/proxy"
)

// command line runner
// TODO handle options and environment vars
func main() {

    arg := os.Args[1]
    if arg == "gateway" {

        // currently registering plugins via main
        proxy.Register(&plugins.Counter{})
        proxy.Register(&plugins.ApiKeyAuth{"X-API"})
        proxy.Register(&plugins.BalanceTracker{})
        proxy.Register(&plugins.NoopFilter{proxy.LifecycleMask(proxy.AccountLookup|proxy.RateLimit)})

        gateway()
    }
}
