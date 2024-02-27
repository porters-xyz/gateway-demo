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
        client = redis.NewClient(&redis.Options{
            Addr: os.Getenv("REDIS_ADDR"),
            Username: os.Getenv("REDIS_USER"),
            Password: os.Getenv("REDIS_PASSWORD"),
            DB: 0,
        })
        log.Println("redis client:", client)
    })
    return client
}

func healthcheck() {
    client := getClient()
    ctx := context.Background()
    status, err := client.Ping(ctx).Result()
    if err != nil {
        log.Println("Error in redis connection", err)
    } else {
        log.Println("redis:", status)
    }
}
