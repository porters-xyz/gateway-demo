package main

import (
    "fmt"
    "porters/db"
    "porters/plugins"
    "porters/plugins/limiter"
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
        proxy.Register(plugins.Auth{"X-API"}, proxy.PRE)
        proxy.Register(plugins.Blocker{}, proxy.PRE)
        proxy.Register(plugins.Counter{}, proxy.PRE)
        proxy.Register(plugins.Headers{}, proxy.PRE)
        proxy.Register(limiter.Quota{}, proxy.PRE)

        fmt.Println("starting gateway")
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
        fmt.Println("waitgroup done")
    }()
}
