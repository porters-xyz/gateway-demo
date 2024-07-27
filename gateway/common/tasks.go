package common

import (
	"errors"
	log "log/slog"
	"sync"
	"time"
)

type Runnable interface {
	error
	Run()
}

type Delayable interface {
	Runnable
	Ready() bool
}

// contains bits necessary to run later
type SimpleTask struct {
	run     func()
	runtime time.Time
}

type RetryTask struct {
	SimpleTask
	runWithSuccess func() bool
	retryCount     int
	retryEvery     time.Duration
	retryGen       int
}

type TaskQueue struct {
	closed  bool
	tasks   chan Runnable
	delayed chan Delayable
	errors  chan error
}

var qInst *TaskQueue
var qmutex sync.Once

// Another singleton
func GetTaskQueue() *TaskQueue {
	qmutex.Do(func() {
		bufferSize := GetConfigInt(JOB_BUFFER_SIZE)
		qInst = &TaskQueue{
			closed:  false,
			tasks:   make(chan Runnable, bufferSize),
			delayed: make(chan Delayable, bufferSize),
			errors:  make(chan error, bufferSize),
		}
	})
	return qInst
}

func (q *TaskQueue) SetupWorkers() {
	// When debugging, may be worth setting to 1 worker, to avoid multiple threads cross emitting logs
	numWorkers := GetConfigInt(NUM_WORKERS)

	for i := 0; i < numWorkers; i++ {
		go worker(q)
	}
	go delayWorker(q)
	go errWorker(q)
}

// use this for graceful shutdown
func (q *TaskQueue) CloseQueue() {
	close(q.tasks)
	close(q.delayed)
	q.closed = true

	shutdownTime := time.Duration(GetConfigInt(SHUTDOWN_DELAY)) * time.Second
	ticker := time.NewTicker(100 * time.Millisecond)
	for {
		select {
		case <-ticker.C:
			if len(q.tasks) == 0 {
				return
			}
		case <-time.After(shutdownTime):
			log.Warn("workers not finished, work may be lost")
			return
		}
	}
}

func (q *TaskQueue) Add(runnable Runnable) {
	q.tasks <- runnable
	JobGauge.WithLabelValues("task").Inc()
}

func (q *TaskQueue) Delay(delayable Delayable) {
	q.delayed <- delayable
	JobGauge.WithLabelValues("delayed").Inc()
}

func (q *TaskQueue) ReportError(err error) {
	q.errors <- err
	JobGauge.WithLabelValues("error").Inc()
}

func worker(q *TaskQueue) {
	for task := range q.tasks {
		processTask(task, q)
		JobGauge.WithLabelValues("task").Set(float64(len(q.tasks)))
	}
}

func processTask(task Runnable, q *TaskQueue) {
	defer func() {
		if r := recover(); r != nil {
			log.Error("Recovered in worker", "error", r)
		}
	}()

	switch t := task.(type) {
	case Combinable:
		task.(Combinable).Combine(q.tasks)
	case Runnable:
		task.Run()
	default:
		log.Warn("unspecified task", "task", task, "type", t)
	}
}

func errWorker(q *TaskQueue) {
	for err := range q.errors {
		log.Error("error encountered", "err", err)
		JobGauge.WithLabelValues("error").Dec()
	}
}

func delayWorker(q *TaskQueue) {
	for i := len(q.delayed); i > 0; i-- {
		task := <-q.delayed
		if q.closed {
			q.ReportError(errors.New("Shutting down"))
		} else if task.Ready() {
			q.Add(task)
			JobGauge.WithLabelValues("delayed").Dec()
		} else {
			q.delayed <- task
		}
	}
	time.Sleep(1 * time.Second)
}

func NewSimpleTask(run func()) *SimpleTask {
	return &SimpleTask{
		run:     run,
		runtime: time.Now(),
	}
}

// SimpleTask can be extended if needed
func (t *SimpleTask) Run() {
	t.run()
}

func (t *SimpleTask) Ready() bool {
	return time.Now().After(t.runtime)
}

func (t *SimpleTask) Error() string {
	// Override to include more details
	return "error processing async task"
}

func NewRetryTask(run func() bool, count int, every time.Duration) *RetryTask {
	return &RetryTask{
		runWithSuccess: run,
		retryCount:     count,
		retryEvery:     every,
	}
}

func (r *RetryTask) Run() {
	ok := r.runWithSuccess()
	if !ok {
		q := GetTaskQueue()
		if r.retryGen < r.retryCount {
			r.runtime = time.Now().Add(r.retryEvery)
			r.retryGen++
			q.delayed <- r
		} else {
			q.errors <- r
		}
	}
}
