package proxy

import (
    "os"
    "sync"
)

// TODO setup queue to push work onto to perform later
// TODO run a configurable number of threads to work through queue
// TODO make it "pluggable" so different types of tasks can operate off queue


// rather than be too chatty, combine multiple tasks into one
// idea here is to eat through the channel combining multiple tasks
// into a single one which can then be persisted
type combinable interface {
   combine(c combinable) combinable
   key() string // combine with others of same key
   value() int // amount to combine
   generation() int // how many times combined
}

type Runnable interface {
    Run()
}

// contains bits necessary to run later
type Task struct {
       
}

type TaskQueue struct {
    Tasks chan Task
}

var q *TaskQueue
var qmutex sync.Once

// Another singleton
func GetTaskQueue() *TaskQueue {
    qmutex.Do(func() {
        bufferSize, ok := os.LookupEnv("JOB_BUFFER_SIZE")
        if !ok {
            bufferSize = 50 // default
        }
        q = &TaskQueue{
            Tasks: make(chan Task, bufferSize),
        }
    })
    return q
}

func (q *TaskQueue) setupWorkers() {
    numWorkers, ok := os.LookupEnv("NUM_WORKERS")
    if !ok {
        numWorkers = 10 // default
    }
    for i := 0; i < numWorkers; i++ {
        go worker(q)
    }
}

// use this for graceful shutdown
func (q *TaskQueue) closeQueue() {
    close(q.Tasks)
}

func worker(q *TaskQueue) {
    for task := range q.Tasks {
        switch t := task.(type) {
        case combinable:
            task.combine()
        case Runnable:
            task.Run()
        }
    }
}
