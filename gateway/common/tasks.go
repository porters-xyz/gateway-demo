package common

import (
    "log"
    "os"
    "strconv"
    "sync"
)

// TODO make it "pluggable" so different types of tasks can operate off queue

type Runnable interface {
    Run()
}

// rather than be too chatty, combine multiple tasks into one
// idea here is to eat through the channel combining multiple tasks
// into a single one which can then be persisted
type Combinable interface {
    Runnable
    Combine(q chan Runnable) // put items back on channel if don't match
    key() string // combine with others of same key
    value() int // amount to combine
    runner() func() // override to set runnable
}

// contains bits necessary to run later
type SimpleTask struct {
    run func()
}

type TaskQueue struct {
    Tasks chan Runnable
    errors chan error
}

type SimpleCombiner struct {
    keyVal string
    intVal int
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

func (q *TaskQueue) setupWorkers() {
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
func (q *TaskQueue) closeQueue() {
    close(q.Tasks)
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

// Implement Combinable if more complex functions are needed
func (c *SimpleCombiner) Combine(q chan Runnable) {
    for i := len(q); i > 0; i-- {
        task := <- q
        switch task.(type) {
        case Combinable:
            d := task.(Combinable)
            if c.keyVal == d.key() {
                c.intVal += d.value()
            } else {
                q <- task
            }
        default:
            q <- task
        }
    }
    // after combining, remove the combinable bits
    q <- &SimpleTask{run: c.runner()}
}

func (c *SimpleCombiner) key() string { return c.keyVal }
func (c *SimpleCombiner) value() int { return c.intVal }
func (c *SimpleCombiner) runner() func() {
    return func() {
        log.Printf("Combined %s to val %d", c.key(), c.value())
    }
}
