package plugins

// Set up leaky buckets for different periods of rate limiting

import (
    "context"
    "fmt"
    "log"
    "net/http"

    rl "github.com/go-redis/redis_rate/v10"

    "porters/db"
    "porters/proxy"
    "porters/utils"
)

type LeakyBucketPlugin struct {
    // Allows for multiple versions of leaky buckets focused on different scopes
    scopeContext string // switch to type on proxy for scopes (tenant, provider, app, client)
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

func (l *LeakyBucketPlugin) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    appId := proxy.PluckAppId(req)
    app := &db.App{Id: appId}
    err := app.Lookup(ctx)
    if err != nil {
        log.Println("err", err)
    }
    buckets := l.getBucketsForScope(ctx, app)
    limiter := db.Limiter()
    for k, v := range buckets {
        res, err := limiter.Allow(ctx, k, v)
        if err != nil {
            // TODO make into appropriate http code
            return proxy.NewHTTPError(http.StatusBadGateway)
        }

        // rate limited
        if res.Allowed == 0 {
            // TODO set retry-after header
            return proxy.NewRateLimitError(v.Rate, v.Period)
        }
    }
    return nil
}

func (l *LeakyBucketPlugin) getBucketsForScope(ctx context.Context, app *db.App) map[string]rl.Limit {
    buckets := make(map[string]rl.Limit)
    rules, err := app.Rules(ctx)
    if err != nil {
        // TODO should this stop all proxying?
        log.Println("error getting rules", err)
        return buckets
    }
    for _, rule := range rules {
        rate, err := utils.ParseRate(rule.Value)
        if err != nil {
            log.Println("Invalid rate")
            continue
        }

        bucket := rl.Limit{
            Rate: rate.Amount,
            Burst: rate.Amount,
            Period: rate.Period,
        }

        buckets[rule.Id] = bucket
    }
    return buckets
}
