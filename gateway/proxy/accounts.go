package proxy

import (
    "context"
    "github.com/redis/go-redis/v9"
    "sync"
)

var client *redis.Client = nil
var once sync.Once

func getClient() *redis.Client {
    once.Do(func() {
        client = redis.NewClient(&redis.Options{
            Addr: "localhost:6379",
            Password: "",
            DB: 0,
        })
    })
    return client
}

func IncRelayCount(ctx context.Context, account string) {
    getClient().Incr(ctx, account)
}

func IsValidAccount(ctx context.Context, account string) bool {
    return false
}
