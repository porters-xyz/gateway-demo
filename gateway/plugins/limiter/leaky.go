package limiter

// Set up leaky buckets for different periods of rate limiting


import (
    "context"
    "net/http"
)

type LeakyBucket struct {
    // TODO each limiter has a bucket of different size
    Limiter
    name string
    key string
    size int64
    rate int64 // specified in count per period
    period int64 // length of period in seconds
}

func (l LeakyBucket) Name() {
    return l.name
}

func (l LeakyBucket) Key() {
    return l.key
}

func (l LeakyBucket) Load() {
    // TODO read from db and initialize
}

func (l LeakyBucket) Filter(ctx context.Context, resp http.ResponseWriter, req http.Request) {
    // TODO read api-key (from context?)
    // TODO check limit
    // TODO move leaky bucket
}
