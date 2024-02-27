package db 

import (
    "context"
    "log"
    "os"
    "sync"

    "github.com/redis/go-redis/v9"
)

const (
    ACCOUNT_SET = "VALID_ACCOUNTS"
)

var client *redis.Client = nil
var redisMutex sync.Once

func getClient() *redis.Client {
    redisMutex.Do(func() {
        // TODO figure out which redis instance to connect to
        opts, err := redis.ParseURL(os.Getenv("REDIS_URL"))
        if err != nil {
            opts = &redis.Options{
                Addr: os.Getenv("REDIS_ADDR"),
                Username: os.Getenv("REDIS_USER"),
                Password: os.Getenv("REDIS_PASSWORD"),
                DB: 0,
            }
        }
        client = redis.NewClient(opts)
        log.Println("redis client:", client)
    })
    return client
}

// TODO make this a method on cache object
func Healthcheck() (string, error) {
    client := getClient()
    ctx := context.Background()
    status, err := client.Ping(ctx).Result()
    if err != nil {
        log.Println("Error in redis connection", err)
    } else {
        log.Println("redis:", status)
    }

    return status, err
}
