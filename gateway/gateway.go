package main

import (
	log "log/slog"
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
	level := common.GetLogLevel()

	log.Info("starting gateway", "level", level)
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
