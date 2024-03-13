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

func (t *Tenant) cache(ctx context.Context) {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, t.Key(),
        "active", t.Active,
        "balance", t.Balance,
        "cachedBalance", t.CachedBalance,
        "cached", cached).Err()
    if err != nil {
        // TODO handle errors should they happen
    }
}

func (a *App) cache(ctx context.Context) {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, a.Key(),
        "active", a.Active,
        "tenant", a.Tenant.Id,
        "cached", cached,
        "missedAt", a.MissedAt).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

func (ar *Apprule) cache(ctx context.Context) {
    // TODO call redis create with key format
    err := getCache().HSet(ctx, ar.Key(), 
        "active", ar.Active,
        "value", ar.Value,
        "active", ar.Active).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

func (p *Paymenttx) cache(ctx context.Context) {
    var err error = nil
    if p.TxType == Credit {
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

func (t *Tenant) Lookup(ctx context.Context) {
    key := t.Key()
    result, err := getCache().HGetAll(ctx, key).Result()
    // TODO errors should probably cause postgres lookup
    if err != nil || len(result) == 0 {
        log.Println("tenant not found", t)
        t.refresh(ctx)
    } else {
        t.Active, _ = strconv.ParseBool(result["active"])
        t.Balance, _ = strconv.Atoi(result["balance"])
        t.CachedBalance, _ = strconv.Atoi(result["cachedBalance"])
        t.CachedAt, _ = time.Parse(time.RFC3339, result["cachedAt"])
    }
}

func (a *App) Lookup(ctx context.Context) {
    key := a.Key()
    log.Println("checking cache for app", key)
    result, err := getCache().HGetAll(ctx, key).Result()
    if err != nil || len(result) == 0 {
        log.Println("missed app", key)
        a.refresh(ctx)
    } else if result["missedAt"] != "" {
        if backoff(result["missedAt"]) {
            log.Println("missed and backing off")
        } else {
            a.refresh(ctx)
        }
    } else {
        log.Println("got app", result)
        a.Active, _ = strconv.ParseBool(result["active"])
        a.Tenant.Id = result["tenant"]
        a.Tenant.Lookup(ctx)
    }
}

// Refresh does the psql calls to build cache
func (t *Tenant) refresh(ctx context.Context) {
    log.Println("refreshing tenant cache", t.Id)
    err := t.fetch(ctx)
    if err != nil {
        log.Println("tenant missing, something's wrong", err)
        // TODO how do we handle this?
    } else {
        err := t.canonicalBalance(ctx)
        if err != nil {
            log.Println("error getting balance")
        }
        t.cache(ctx)
    }
}

func (a *App) refresh(ctx context.Context) {
    log.Println("refreshing app cache", a.Id)
    err := a.fetch(ctx)
    if err != nil {
        log.Println("err seen", err)
        a.MissedAt = time.Now()
    } else {
        a.Tenant.Lookup(ctx)
    }
    a.cache(ctx)
}

// TODO hardcoding 1 minute cache refresh for now, move to config
func (t *Tenant) refreshAt() time.Time {
    return t.CachedAt.Add(1 * time.Minute)
}

func (a *App) refreshAt() time.Time {
    return a.CachedAt.Add(1 * time.Minute)
}

func backoff(missedAt string) bool {
    missedTime, _ := time.Parse(time.RFC3339, missedAt)
    return time.Now().After(missedTime.Add(5 * time.Minute))
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
func (t *Tenant) UseRelay(ctx context.Context) {
    key := t.Key()
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
