package db 

import (
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
            Password: os.Getenv("REDIS_PASS"),
            DB: 0,
        })
    })
    return client
}
