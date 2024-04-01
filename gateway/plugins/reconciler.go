package plugins

import (
    "time"

    "porters/common"
)

// TODO Add to the job queue to run every hour? or on shutdown

type Reconciler struct {
    runEvery time.Duration
    ticker *time.Ticker
}

type reconcileTask struct {
    common.Runnable
}

func (r *Reconciler) Name() string {
    return "Usage Reconciliation"
}

func (r *Reconciler) Key() string {
    return "RECONCILE"
}

func (r *Reconciler) Load() {
    r.ticker = time.NewTicker(r.runEvery)
    go r.spawnTasks()
}

func (r *Reconciler) spawnTasks() {
    for range r.ticker.C {
        // TODO go through redis and add to job queue
    }
}

func (t *reconcileTask) Run() {
    // TODO In transaction grab from redis, write to postgres, clear redis
}
