package db 

import (
    "github.com/redis/go-redis/v9"
    "sync"
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
            Addr: "localhost:6379",
            Password: "",
            DB: 0,
        })
    })
    return client
}
