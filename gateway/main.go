package main

import (
    "fmt"
    "porters/demo"
    "porters/proxy"
    "os"
)

// command line runner
// TODO handle options and environment vars
func main() {
    arg := os.Args[1]
    if arg == "gateway" {
        fmt.Println("starting gateway")
        proxy.Start()
    }

    if arg == "test" {
        fmt.Println("starting test server")
        demo.Serve()
    }
}
