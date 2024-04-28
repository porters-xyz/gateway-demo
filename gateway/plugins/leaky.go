package plugins

// Set up leaky buckets for different periods of rate limiting


import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"

    "porters/db"
    "porters/proxy"
    "porters/utils"
)

type LeakyBucketPlugin struct {
    // Allows for multiple versions of leaky buckets focused on different scopes
    scopeContext string // switch to type on proxy for scopes (tenant, provider, app, client)
}

// For each request lookup set of buckets for app/key/tenant etc
// TODO Build from app rules if not exist
type LeakyBucket struct {
    // TODO each limiter has a bucket of different size
    size int
    rate int // specified in count per period
    period time.Duration
}

func (l *LeakyBucketPlugin) Name() string {
    return "leaky bucket"
}

func (l *LeakyBucketPlugin) Key() string {
    return fmt.Sprintf(`%s:%s`, "LEAKY", l.scopeContext)
}

func (l *LeakyBucketPlugin) Load() {
    // TODO initialize
}

func (l *LeakyBucketPlugin) HandleRequest(req *http.Request) {
    ctx := req.Context()
    appId := proxy.PluckAppId(req)
    app := &db.App{Id: appId}
    err := app.Lookup(ctx)
    if err != nil {
        log.Println("err", err)
    }
    buckets := l.getBucketsForScope(ctx, app)
    for _, b := range buckets {
        b.leak()
    }
}

func (l *LeakyBucketPlugin) HandleResponse(resp *http.Response) {

}

func (l *LeakyBucketPlugin) getBucketsForScope(ctx context.Context, app *db.App) []LeakyBucket {
    var buckets []LeakyBucket
    key := fmt.Sprintf("%s:%s", l.Key(), app.Id)
    iter := db.ScanKeys(ctx, key)
    for iter.Next(ctx) {
        // TODO grab value from redis
        //ratestr := iter.Val()
        rate, err := utils.ParseRate("")
        if err != nil {
            log.Println("Invalid rate")
            continue
        }

        bucket := LeakyBucket{
            size: rate.Amount,
            rate: rate.Amount,
            period: rate.Period,
        }
        buckets = append(buckets, bucket)
    }
    return buckets
}

func (l *LeakyBucket) leak() {
    // TODO refill bucket if enough time has elapsed
    // TODO check if empty
    // TODO take from bucket
}
