package main

import (
    "fmt"
    "porters/db"
    "porters/demo"
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
        proxy.Register(proxy.Auth{"X-API"}, proxy.PRE)
        proxy.Register(plugins.Counter{}, proxy.PRE)
        proxy.Register(plugins.Headers{}, proxy.PRE)
        proxy.Register(limiter.Quota{}, proxy.PRE)

        fmt.Println("starting gateway")
        proxy.Start()
    }

    if arg == "test" {
        fmt.Println("starting test server")
        demo.Serve()
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
