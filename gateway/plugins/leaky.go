package plugins

// Set up leaky buckets for different periods of rate limiting


import (
    "fmt"
    "net/http"
)

type LeakyBucketPlugin struct {
    // Allows for multiple versions of leaky buckets focused on different scopes
    scopeContext string // switch to type on proxy for scopes (tenant, provider, app, client)
}

// For each request lookup set of buckets for app/key/tenant etc
type LeakyBucket struct {
    // TODO each limiter has a bucket of different size
    size int64
    rate int64 // specified in count per period
    period int64 // length of period in seconds
}

func (l LeakyBucketPlugin) Name() string {
    return "leaky bucket"
}

func (l LeakyBucketPlugin) Key() string {
    return fmt.Sprintf(`%s:%s`, "LEAKY", l.scopeContext)
}

func (l LeakyBucketPlugin) Load() {
    // TODO initialize
}

func (l LeakyBucketPlugin) HandleRequest(req *http.Request) {
    // TODO read api-key (from context?)
    // TODO check limit
    // TODO if out, synchronously refill; else async refill
    // TODO take from bucket (leak/decrement)
}
