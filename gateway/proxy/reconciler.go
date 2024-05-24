package proxy

import (
    "context"
    log "log/slog"
    "time"

    "porters/common"
    "porters/db"
)

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

func (r *Reconciler) Load() {
    r.ticker = time.NewTicker(r.runEvery)
    go r.spawnTasks()
}

func (r *Reconciler) spawnTasks() {
    queue := common.GetTaskQueue()
    ctx := context.Background()
    for range r.ticker.C {
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
        }
    }
}

func (t *reconcileTask) Run() {
    ctx := context.Background()
    replayfunc, err := db.ReconcileRelays(ctx, t.relaytx)
    if err != nil {
        log.Error("unable to access cached relay use", "err", err)
    }

    t.RetryTask = common.NewRetryTask(replayfunc, 5, 1 * time.Minute)
    t.RetryTask.Run()
}
