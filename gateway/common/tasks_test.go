package common

import (
    "fmt"
    "testing"
    "time"
)

func TestTask(t *testing.T) {
    queue := GetTaskQueue()
    queue.SetupWorkers()

    for i:=0; i<1000; i++ {
        j := i
        queue.Tasks <- &SimpleTask{
            run: func() {
                time.Sleep(10 * time.Millisecond)
                t.Logf("done: %d", j)
            },
        }
    }

    time.Sleep(500 * time.Millisecond)
    if len(queue.Tasks) > 0 {
        t.Fatal("queue should have finished")
    }
}

// TODO use this test to figure out the right blend
// combining is meant to compact multiple updates to redis into one
// rather than incr + incr + incr just do incrBy 3
// This costs a bit of compute and complicates the job queue
// come back to this when the use is more necessary
func TestCombiner(t *testing.T) {
    t.Setenv("JOB_BUFFER_SIZE", "1000")
    queue := GetTaskQueue()

    for i:=0; i<1000; i++ {
        key := fmt.Sprintf("key:%d", i % 2)
        queue.Tasks <- &SimpleCombiner{
            keyVal: key,
            intVal: 1,
        }
    }

    queue.SetupWorkers()

    time.Sleep(1000 * time.Millisecond)
    if len(queue.Tasks) > 0 {
        t.Fatal("combining should have finished")
    }
}

func TestClose(t *testing.T) {
    queue := GetTaskQueue()
    queue.SetupWorkers()

    queue.CloseQueue()
}
