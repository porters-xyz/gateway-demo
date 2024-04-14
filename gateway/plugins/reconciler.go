package plugins

import (
    "context"
    "time"

    "porters/common"
    "porters/db"
)

// TODO Add to the job queue to run every hour? or on shutdown

type Reconciler struct {
    runEvery time.Duration
    ticker *time.Ticker
}

type reconcileTask struct {
    common.Runnable
    relaytx *db.Relaytx
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
    queue := common.GetTaskQueue()
    ctx := context.Background()
    for range r.ticker.C {
        // TODO go through redis and add to job queue
        // TODO figure out where per-chain usage stored
        iter := db.ScanKeys(ctx, "PRODUCT")
        for iter.Next(ctx) {
            //strval := iter.Val() // use for building relaytx
            rtx := &db.Relaytx{
                
            }
            task := &reconcileTask{
                relaytx: rtx,
            }
            queue.Tasks <- task
        }
    }
}

func (t *reconcileTask) Run() {
    // TODO In transaction grab from redis, write to postgres, clear redis
}