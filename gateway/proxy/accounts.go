package proxy

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
    "strconv"
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

func DecCounter(ctx context.Context, name string) int64 {
    result, err := getClient().Decr(ctx, name).Result()
    if err != nil {
        // TODO handle errors properly
        return 0
    }
    return result
}

// Uses QUOTA to determine account existing, does not guarantee relays remaining
// TODO use another key that is more stable?
func IsValidAccount(ctx context.Context, account string) bool {
    key := "QUOTA:" + account
    intval := GetIntVal(ctx, key)
    return intval > 0
}

func GetIntVal(ctx context.Context, name string) int {
    result, err := getClient().Get(ctx, name).Result()
    if err != nil {
        // TODO how do we handle errors
        return 0
    }
    intval, err := strconv.Atoi(result)
    if err != nil {
        // TODO what do we do if it isn't an int
        return 0
    }
    return intval
}
