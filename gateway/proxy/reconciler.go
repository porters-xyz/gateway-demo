package proxy

import (
    "context"
    "log"
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
    *common.RetryTask
    relaytx *db.Relaytx
}

func NewReconciler(seconds int) *Reconciler {
    return &Reconciler{
        runEvery: time.Duration(seconds) * time.Second,
    }
}

func (r *Reconciler) Name() string {
    return "Usage Reconciliation"
}

func (r *Reconciler) Key() string {
    return "RECONCILE"
}

// TODO move this to delayed queue
func (r *Reconciler) Load() {
    r.ticker = time.NewTicker(r.runEvery)
    go r.spawnTasks()
}

func (r *Reconciler) spawnTasks() {
    queue := common.GetTaskQueue()
    ctx := context.Background()
    // TODO ticker is wrong here, should use age to decide if needs write to db
    for range r.ticker.C {
        // TODO go through redis and add to job queue
        // TODO figure out where per-chain usage stored
        iter := db.ScanKeys(ctx, "RELAYTX")
        for iter.Next(ctx) {
            rtxkey := iter.Val() // use for building relaytx
            
            rtx, ok := db.RelaytxFromKey(ctx, rtxkey)
            if ok {
                task := &reconcileTask{
                    relaytx: rtx, 
                }
                queue.Add(task)
            }
            task := &reconcileTask{
                relaytx: rtx,
            }
            queue.Add(task)
        }
    }
}

func (t *reconcileTask) Run() {
    // TODO In transaction grab from redis, write to postgres, clear redis
    ctx := context.Background()
    replayfunc, err := db.ReconcileRelays(ctx, t.relaytx)
    if err != nil {
        log.Println("unable to access cached relay use", err)
    }

    t.RetryTask = common.NewRetryTask(replayfunc, 5, 1 * time.Minute)
    t.RetryTask.Run()
}
