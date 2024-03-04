package db 

import (
    "context"
    "log"
    "os"
    "strconv"
    "sync"
    "time"

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

type refreshable interface {
    refreshAt() time.Time
}

type incrementable interface {
    Key() string
    Field() string
}

type decrementable interface {
    Key() string
    Field() string
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

// TODO make this work for all models
func needsRefresh(r refreshable) bool {
    return r.refreshAt().Compare(time.Now()) > 0
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

func (t *tenant) cache(ctx context.Context) {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, t.Key(),
        "active", t.active,
        "cached", cached).Err()
    if err != nil {
        // TODO handle errors should they happen
    }
}

func (a *app) cache(ctx context.Context) {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, a.Key(),
        "active", a.active,
        "tenant", a.tenant.id,
        "cached", cached).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

func (ar *apprule) cache(ctx context.Context) {
    // TODO call redis create with key format
    err := getCache().HSet(ctx, ar.Key(), 
        "active", ar.active,
        "value", ar.value,
        "active", ar.active).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

func (p *paymenttx) cache(ctx context.Context) {
    var err error = nil
    if p.txType == Credit {
        //err = getCache().HIncrBy(ctx, p.Key(), "cached_remaining", int64(p.amount)).Err()
        //if err != nil {
            // TODO handle errors should they happen
        //}
        //err = getCache().HIncrBy(ctx, tenant.Key(), "relays_remaining", int64(p.amount)).Err()
    } else {
        //err = getCache().HIncrBy(ctx, tenant.Key(), "cached_remaining", -int64(p.amount)).Err()
    }
    if err != nil {
        // TODO handle errors should they happen
    }
}

// TODO can this be done in single hop? maybe put in lua script?
// TODO need to count each use within a given scope
//func (p *productCounter) increment(ctx context.Context) {
    //app := p.app
    //tenant := app.tenant
    // TODO increment all the right counters
    // TODO decrement all the right counters
//}

// Uses QUOTA to determine account existing, does not guarantee relays remaining
// TODO use tenant hash
// TODO remove logging
func (t *tenant) lookup(ctx context.Context) (*tenant, bool) {
    key := t.Key()
    result, err := getCache().HGet(ctx, key, "enabled").Result()
    resbool, err2 := strconv.ParseBool(result)
    log.Println("enabled", resbool)
    if err != nil || err2 != nil{
        // TODO clean this up
        resbool = false
    }
    return t, resbool
}

// utility function
func GetIntVal(ctx context.Context, name string) int {
    result, err := getCache().Get(ctx, name).Result()
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

func Increment(ctx context.Context, incr incrementable, amount int) int {
    incrBy := int64(amount)
    newVal, err := getCache().HIncrBy(ctx, incr.Key(), incr.Field(), incrBy).Result()
    if err != nil {
        // TODO do something with error
    }
    return int(newVal)
}

func Decrement(ctx context.Context, decr decrementable, amount int) int {
    decrBy := -int64(amount)
    newVal, err := getCache().HIncrBy(ctx, decr.Key(), decr.Field(), decrBy).Result()
    if err != nil {
        // TODO handle errors
    }
    return int(newVal)
}

// TODO check redis, if missing check postgres (and cache), if neither return false
// TODO change account to tenant
// TODO uncomment with app id for lookup, replace API key verification as rule
/*
func LookupAccount(ctx context.Context, apiKey string) (Account, bool) {
    // TODO do this in tx that checks and gets account information?
    hashedKey := utils.Hash(apiKey)
    key := GenApiKey(hashedKey)
    result, err := getCache().HGet(ctx, key, "account").Result()
    if err != nil {
        // TODO handle errors better
        return Account{}, false
    }
    return Account{result}, true
}


// TODO make this a method of productCounter
func UseRelay(ctx context.Context, apiKey string) {
    hashedKey := utils.Hash(apiKey)
    key := GenApiKey(hashedKey)
    account, err := getCache().HGet(ctx, key, "account").Result()
    if err != nil {
        // TODO log error to alert, will need manual cleanup
    } else {
        acctKey := GenAccountKey(account)
        err2 := getCache().HIncrBy(ctx, acctKey, "relays_remaining", -1).Err()
        if err2 != nil {
            // TODO also clean this up, not decr'd
        }
    }
}

// TODO This should loookup tenant by app id
func HasRelays(ctx context.Context, apiKey string) bool {
    hashedKey := utils.Hash(apiKey)
    key := GenApiKey(hashedKey)
    account, err := getCache().HGet(ctx, key, "account").Result()
    if err != nil {
        // TODO account issues need to be handled
    } else {
        acctKey := GenAccountKey(account)
        remainder, err2 := getCache().HGet(ctx, acctKey, "relays_remaining").Result()
        if err2 != nil {
            // TODO another error to handle
        }
        intval, err3 := strconv.Atoi(remainder)
        if err3 != nil {
            // TODO something wrong on the redis side
        } else {
            return intval > 0
        }
    }
    // TODO probably a false negative
    return false
}
*/
