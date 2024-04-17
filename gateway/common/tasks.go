package common

import (
    "log"
    "os"
    "strconv"
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
        bufferSize := 50 // default
        bufferSizeEnv, ok := os.LookupEnv("JOB_BUFFER_SIZE")
        bufferSizeInt, err := strconv.Atoi(bufferSizeEnv)
        if ok && err == nil {
            bufferSize = bufferSizeInt
        } else {
            log.Println("unable to read JOB_BUFFER_SIZE from env, using default")
        }
        q = &TaskQueue{
            Tasks: make(chan Runnable, bufferSize),
            errors: make(chan error, bufferSize),
        }
    })
    return q
}

func (q *TaskQueue) SetupWorkers() {
    numWorkers := 10 // default
    numWorkersEnv, ok := os.LookupEnv("NUM_WORKERS")
    numWorkersInt, err := strconv.Atoi(numWorkersEnv)
    if ok && err == nil {
        numWorkers = numWorkersInt
    } else {
        log.Println("unable to read NUM_WORKERS from env, using default")
    }
    for i := 0; i < numWorkers; i++ {
        go worker(q)
    }
}

// use this for graceful shutdown
func (q *TaskQueue) CloseQueue() {
    close(q.Tasks)

    ticker := time.NewTicker(100 * time.Millisecond)
    for {
        select {
        case <-ticker.C:
            if len(q.Tasks) == 0 {
                return
            }
        case <-time.After(SHUTDOWN_DELAY):
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
