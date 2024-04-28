package common

import (
    "log"
    "sync"
    "time"
)

// TODO make it "pluggable" so different types of tasks can operate off queue

type Runnable interface {
    Run()
}

// contains bits necessary to run later
type SimpleTask struct {
    run func()
}

type TaskQueue struct {
    Tasks chan Runnable
    errors chan error
}

var q *TaskQueue
var qmutex sync.Once

// Another singleton
func GetTaskQueue() *TaskQueue {
    qmutex.Do(func() {
        bufferSize := GetConfigInt(JOB_BUFFER_SIZE)
        q = &TaskQueue{
            Tasks: make(chan Runnable, bufferSize),
            errors: make(chan error, bufferSize),
        }
    })
    return q
}

// TODO include workers to clear out error channel
func (q *TaskQueue) SetupWorkers() {
    numWorkers := GetConfigInt(NUM_WORKERS)
    for i := 0; i < numWorkers; i++ {
        go worker(q)
    }
}

// use this for graceful shutdown
func (q *TaskQueue) CloseQueue() {
    close(q.Tasks)
    shutdownTime := time.Duration(GetConfigInt(SHUTDOWN_DELAY)) * time.Second
    ticker := time.NewTicker(100 * time.Millisecond)
    for {
        select {
        case <-ticker.C:
            if len(q.Tasks) == 0 {
                return
            }
        case <-time.After(shutdownTime):
            log.Println("workers not finished, work may be lost")
            return
        }
    }
}

func worker(q *TaskQueue) {
    for task := range q.Tasks {
        switch t := task.(type) {
        case Combinable:
            task.(Combinable).Combine(q.Tasks)
        case Runnable:
            task.Run()
        default:
            log.Println("unspecified task", task, t)
        }
    }
}

// SimpleTask can be extended if needed
func (t *SimpleTask) Run() {
    t.run()
}
