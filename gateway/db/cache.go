package db 

import (
    "context"
    "log"
    "os"
    "sync"

    "github.com/redis/go-redis/v9"

    "porters/common"
)

const (
    ACCOUNT_SET = "VALID_ACCOUNTS"
    REDIS = "redis"
)

// access redis functions through this object
type Cache struct {

}

var client *redis.Client
var redisMutex sync.Once

func getCache() *redis.Client {
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
func (c *Cache) Healthcheck() *common.HealthCheckStatus {
    hcs := common.NewHealthCheckStatus()
    client := getCache()
    ctx := context.Background()
    status, err := client.Ping(ctx).Result()
    if err != nil {
        hcs.AddError(REDIS, err)
    } else {
        hcs.AddHealthy(REDIS, status)
    }

    return hcs
}

func (t *tenant) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
    err := getCache().HSet(ctx, GenAccountKey(t.id), "enabled", t.enabled).Err()
    if err != nil {
        // TODO handle errors should they happen
    }
}

func (a *apiKey) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
    err := getCache().HSet(ctx, GenApiKey(a.key), "account", a.tenantId, "enabled", a.enabled).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

// TODO can this be done in single hop? maybe put in lua script?
func (p *paymentTx) writeToCache(ctx context.Context) {
    var err error
    if p.txType == Credit {
        err = getCache().HIncrBy(ctx, GenAccountKey(p.tenantId), "cached_remaining", int64(p.amount)).Err()
        if err != nil {
            // TODO handle errors should they happen
        }
        err = getCache().HIncrBy(ctx, GenAccountKey(p.tenantId), "relays_remaining", int64(p.amount)).Err()
    } else {
        err = getCache().HIncrBy(ctx, GenAccountKey(p.tenantId), "cached_remaining", -int64(p.amount)).Err()
    }
    if err != nil {
        // TODO handle errors should they happen
    }
}
