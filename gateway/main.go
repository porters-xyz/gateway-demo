package main

import (
    "os"

    "porters/plugins"
    "porters/proxy"
)

// command line runner
func main() {

    arg := os.Args[1]
    if arg == "gateway" {

        // currently registering plugins via main
        proxy.Register(&plugins.ApiKeyAuth{"X-API"})
        proxy.Register(&plugins.BalanceTracker{})
        proxy.Register(&plugins.LeakyBucketPlugin{"APP"})
        proxy.Register(&plugins.ProductFilter{})
        proxy.Register(&plugins.UserAgentFilter{})
        proxy.Register(&plugins.AllowedOriginFilter{})
        proxy.Register(proxy.NewReconciler(300)) // seconds

        gateway()
    }
}
