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

type Delayable interface {
    Runnable
    Ready() bool
}

// contains bits necessary to run later
type SimpleTask struct {
    run func()
    runtime time.Time
}

type TaskQueue struct {
    tasks chan Runnable
    delayed chan Delayable
    errors chan error
}

var q *TaskQueue
var qmutex sync.Once

// Another singleton
func GetTaskQueue() *TaskQueue {
    qmutex.Do(func() {
        bufferSize := GetConfigInt(JOB_BUFFER_SIZE)
        q = &TaskQueue{
            tasks: make(chan Runnable, bufferSize),
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
    close(q.tasks)
    shutdownTime := time.Duration(GetConfigInt(SHUTDOWN_DELAY)) * time.Second
    ticker := time.NewTicker(100 * time.Millisecond)
    for {
        select {
        case <-ticker.C:
            if len(q.tasks) == 0 {
                return
            }
        case <-time.After(shutdownTime):
            log.Println("workers not finished, work may be lost")
            return
        }
    }
}

func (q *TaskQueue) Add(runnable Runnable) {
   q.tasks <- runnable
   JobGauge.Inc()
}

func (q *TaskQueue) ReportError(err error) {
    q.errors <- err
    ErrGauge.Inc()
}

func worker(q *TaskQueue) {
    for task := range q.tasks {
        switch t := task.(type) {
        case Combinable:
            task.(Combinable).Combine(q.tasks)
        case Runnable:
            task.Run()
        default:
            log.Println("unspecified task", task, t)
        }
        JobGauge.Set(float64(len(q.tasks)))
    }
}

// TODO do more than log
func errWorkers(q *TaskQueue) {
    for err := range q.errors {
        log.Println("error encountered", err)
        ErrGauge.Dec()
    }
}

func delayWorker(q *TaskQueue) {
    for task := range
}

// SimpleTask can be extended if needed
func (t *SimpleTask) Run() {
    t.run()
}

func (t *SimpleTask) Ready() bool {
    return time.Now() > t.runtime {
}
