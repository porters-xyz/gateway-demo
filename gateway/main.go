package main

import (
    "fmt"
    "porters/demo"
    "porters/plugins"
    "porters/plugins/limiter"
    "porters/proxy"
    "os"
)

// command line runner
// TODO handle options and environment vars
func main() {

    arg := os.Args[1]
    if arg == "gateway" {

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
