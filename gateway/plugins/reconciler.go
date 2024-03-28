package plugins

import (
    "time"

    "porters/proxy"
)

// TODO Add to the job queue to run every hour? or on shutdown

type Reconciler struct {
    runEvery time.Duration
}

type reconcileTask struct {

}

func (r *Reconciler) Name() string {
    return "Usage Reconciliation"
}

func (r *Reconciler) Key() string {
    return "RECONCILE"
}

func (r *Reconciler) Load() {
    //task := proxy.Task{
    //    timer: time.NewTimer(r.runEvery)
    //}
}

func (r *Reconciler) spawnTasks {
    time.Ticker
}

func (t *reconcileTask) Run() {
    // TODO In transaction grab from redis, write to postgres, clear redis
}
