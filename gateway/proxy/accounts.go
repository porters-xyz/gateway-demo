package proxy

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
    "sync"
)

var client *redis.Client = nil
var redisMutex sync.Once

func getClient() *redis.Client {
    redisMutex.Do(func() {
        client = redis.NewClient(&redis.Options{
            Addr: "localhost:6379",
            Password: "",
            DB: 0,
        })
    })
    return client
}

func IncRelayCount(ctx context.Context, account string) {
    // TODO figure out account scheme
    _, err := getClient().Incr(ctx, account).Result()
    if err != nil {
        // TODO handle errors properly
        fmt.Println(err)
        return
    }
    return
}

// TODO remove, just for testing
func IncCounter(ctx context.Context, name string) int64 { 
    result, err := getClient().Incr(ctx, name).Result()
    if err != nil {
        // TODO handle errors properly
        return 0
    }
    return result
}

func IsValidAccount(ctx context.Context, account string) bool {
    return false
}
