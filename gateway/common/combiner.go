package common

import (
)

// rather than be too chatty, combine multiple tasks into one
// idea here is to eat through the channel combining multiple tasks
// into a single one which can then be persisted
type Combinable interface {
    Runnable
    Combine(q chan Runnable) // put items back on channel if don't match
    key() string // combine with others of same key
    value() int // amount to combine
    gen() int // allow combiners to mate
}

type SimpleCombiner struct {
    SimpleTask
    keyVal string
    intVal int
    genVal int
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
                c.genVal = max(c.gen(), d.gen())
            } else {
                q <- task
            }
        default:
            q <- task
        }
    }
    // after combining, remove the combinable bits
    if c.gen() >= 10 {
        c.run = c.runner()
        q <- &c.SimpleTask
    } else {
        c.genVal++
        q <- c
    }
}

func (c *SimpleCombiner) key() string { return c.keyVal }
func (c *SimpleCombiner) value() int { return c.intVal }
func (c *SimpleCombiner) gen() int { return c.genVal }
// This gets set to the SimpleTask.run
// Simple version only logs, need to extend to push to redis, etc
func (c *SimpleCombiner) runner() func() {
    return func() {
        //log.Printf("combined %s to %d", c.keyVal, c.intVal)
    }
}
