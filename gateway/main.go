package main

import (
    "log"
    "porters/db"
    "porters/plugins"
    "porters/proxy"
    "os"
    "sync"
)

// command line runner
// TODO handle options and environment vars
func main() {

    arg := os.Args[1]
    if arg == "gateway" {
        startupPostgresSync()
        // currently registering plugins via main
        proxy.Register(plugins.Counter{})
        //proxy.Register(plugins.ApiKeyAuth{"X-API"})
        //proxy.Register(plugins.Quota{})
        mask := proxy.LifecycleMask(proxy.Auth|proxy.AccountLookup|proxy.BalanceCheck|proxy.RateLimit)
        proxy.Register(plugins.NoopFilter{LifecycleStage: mask})

        log.Println("starting gateway")
        proxy.Start()
    }
}

func startupPostgresSync() {
    s := db.ConnectSync()

    var wg sync.WaitGroup

    wg.Add(3)
    go s.Listen("tenant_change", &wg)
    go s.Listen("apikey_change", &wg)
    go s.Listen("payment_tx", &wg)
    go func() {
        wg.Wait()
        s.Close()
        log.Println("waitgroup done")
    }()
}
