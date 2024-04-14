package main

import (
    "log"
    "os"

    "porters/common"
    "porters/plugins"
    "porters/proxy"
)

// command line runner
// TODO handle options and environment vars
func main() {

    arg := os.Args[1]
    if arg == "gateway" {

        // Start job queue
        common.GetTaskQueue().SetupWorkers()

        // currently registering plugins via main
        proxy.Register(&plugins.Counter{})
        proxy.Register(&plugins.ApiKeyAuth{"X-API"})
        proxy.Register(&plugins.BalanceTracker{})
        proxy.Register(&plugins.NoopFilter{proxy.LifecycleMask(proxy.AccountLookup|proxy.RateLimit)})

        log.Println("starting gateway")
        proxy.Start()
    }
}
