package main

import (
    "log"
    "os"
    "os/signal"
    "sync"
    "syscall"

    "porters/common"
    "porters/proxy"
)

func gateway() {
    // Start job queue
    common.GetTaskQueue().SetupWorkers()

    log.Println("starting gateway")
    proxy.Start()

    done := make(chan os.Signal, 1)
    signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)
    <-done
    shutdown()
}

func shutdown() {
    var wg sync.WaitGroup

    wg.Add(2)
    go func() {
        defer wg.Done()
        proxy.Stop()
    }()
    go func() {
        defer wg.Done()
        common.GetTaskQueue().CloseQueue()
    }()
    wg.Wait()
}
