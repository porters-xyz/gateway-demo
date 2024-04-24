package db 

import (
    "context"
    "fmt"
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
    MISSED_FALSE = "0001-01-01T00:00:00Z"
)

// access redis functions through this object
type Cache struct {

}

type refreshable interface {
    refreshAt() time.Time
    refresh(ctx context.Context) error
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

func (t *Tenant) cache(ctx context.Context) error {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, t.Key(),
        "active", t.Active,
        "balance", t.Balance,
        "cached", cached).Err()
    if err != nil {
        // TODO handle errors should they happen
        return err
    }
    return nil
}

func (a *App) cache(ctx context.Context) error {
    // TODO call redis create with key format
    cached := time.Now()
    err := getCache().HSet(ctx, a.Key(),
        "active", a.Active,
        "tenant", a.Tenant.Id,
        "cached", cached,
        "missedAt", a.MissedAt).Err()
    if err != nil {
        // TODO handle errors correctly
        return err
    }
    return nil
}

func (ar *Apprule) cache(ctx context.Context) error {
    // TODO call redis create with key format
    err := getCache().HSet(ctx, ar.Key(), 
        "active", ar.Active,
        "value", ar.Value,
        "active", ar.Active).Err()
    if err != nil {
        // TODO handle errors correctly
        return err
    }
    return nil
}

func (p *Product) cache(ctx context.Context) error {
    err := getCache().HSet(ctx, p.Key(),
        "num", p.Num,
        "weight", p.Weight).Err()
    if err != nil {
        // TODO handle error here rather than return it
        return err
    }
    return nil
}

func (p *Paymenttx) cache(ctx context.Context) error {
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
        return err
    }
    return nil
}

// TODO can this be done in single hop? maybe put in lua script?
// TODO need to count each use within a given scope
//func (p *productCounter) increment(ctx context.Context) {
    //app := p.app
    //tenant := app.tenant
    // TODO increment all the right counters
    // TODO decrement all the right counters
//}

func (t *Tenant) Lookup(ctx context.Context) error {
    fromContext, ok := tenantFromContext(ctx)
    if ok {
        *t = fromContext
    } else {
        key := t.Key()
        result, err := getCache().HGetAll(ctx, key).Result()
        // TODO errors should probably cause postgres lookup
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Println("tenant not found", t)
            t.refresh(ctx)
        } else {
            t.Active, _ = strconv.ParseBool(result["active"])
            t.Balance, _ = strconv.Atoi(result["balance"])
            t.CachedAt, _ = time.Parse(time.RFC3339, result["cachedAt"])
        }
    }
    return nil
}

func (a *App) Lookup(ctx context.Context) error {
    fromContext, ok := appFromContext(ctx)
    if ok {
        *a = fromContext
    } else {
        key := a.Key()
        log.Println("checking cache for app", key)
        result, err := getCache().HGetAll(ctx, key).Result()
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Println("missed app", key)
            a.refresh(ctx)
        } else if result["missedAt"] != MISSED_FALSE {
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
    return nil
}

func (a *App) Rules(ctx context.Context) ([]AppRule, error) {
    key := fmt.Sprintf("%s:%s", APPRULE, a.Id)

    iter := ScanKeys(ctx, key)
    for iter.Next() {
        iter.Val()
        result, err := getCache().HGetAll(ctx, key).Result()
    
    }
}

func (p *Product) Lookup(ctx context.Context) error {
    fromContext, ok := productFromContext(ctx)
    if ok {
        *p = fromContext
    } else {
        key := p.Key()
        log.Println("finding product from cache:", key)
        result, err := getCache().HGetAll(ctx, key).Result()
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Println("missed product", key)
            p.refresh(ctx)
        } else if result["missedAt"] != MISSED_FALSE {
            if backoff(result["missedAt"]) {
                log.Println("missed and backing off")
            } else {
                p.refresh(ctx)
            }
        } else {
            log.Println("got product:", result)
            p.Num, _ = strconv.Atoi(result["num"])
            p.Weight, _ = strconv.Atoi(result["weight"])
        }
    }
    return nil
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
            log.Println("error getting balance", err)
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

func (p *Product) refresh(ctx context.Context) {
    log.Println("refreshing product cache", p.Id)
    err := p.fetch(ctx)
    if err != nil {
        log.Println("err getting product", err)
        p.MissedAt = time.Now()
    }
    p.cache(ctx)
}

// TODO hardcoding 1 minute cache refresh for now, move to config
func (t *Tenant) refreshAt() time.Time {
    return t.CachedAt.Add(1 * time.Minute)
}

func (a *App) refreshAt() time.Time {
    return a.CachedAt.Add(1 * time.Minute)
}

func backoff(missedAt string) bool {
    missedTime, err := time.Parse(time.RFC3339, missedAt)
    if err != nil {
        return false // something is wrong with time format, refresh to fix
    }
    return time.Now().Before(missedTime.Add(5 * time.Minute))
}

// TODO might want to expire at different cadences, move to refreshAt
func expired(cachedAt string) bool {
    cachedTime, err := time.Parse(time.RFC3339, cachedAt)
    if err != nil {
        return true
    }
    return time.Now().After(cachedTime.Add(1 * time.Minute))
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

func IncrementField(ctx context.Context, incr incrementable, amount int) int {
    incrBy := int64(amount)
    newVal, err := getCache().HIncrBy(ctx, incr.Key(), incr.Field(), incrBy).Result()
    if err != nil {
        // TODO do something with error
    }
    return int(newVal)
}

func DecrementField(ctx context.Context, decr decrementable, amount int) int {
    decrBy := -int64(amount)
    newVal, err := getCache().HIncrBy(ctx, decr.Key(), decr.Field(), decrBy).Result()
    if err != nil {
        // TODO handle errors
    }
    return int(newVal)
}

func IncrementCounter(ctx context.Context, key string, amount int) int {
    incrBy := int64(amount)
    newVal, err := getCache().IncrBy(ctx, key, incrBy).Result()
    if err != nil {
        // TODO handle error
    }
    return int(newVal)
}

func DecrementCounter(ctx context.Context, key string, amount int) int {
    decrBy := int64(amount)
    newVal, err := getCache().DecrBy(ctx, key, decrBy).Result()
    if err != nil {
        // TODO handle error
    }
    return int(newVal)
}

// returns false if counter already exists
func InitCounter(ctx context.Context, key string, initValue int) (bool, error) {
    // TODO no expiration for now
    return getCache().SetNX(ctx, key, initValue, 0).Result()
}

func ScanKeys(ctx context.Context, key string) *redis.ScanIterator {
    scankey := fmt.Sprintf("%s:*", key)
    iter := getCache().Scan(ctx, 0, scankey, 0).Iterator()
    return iter
}

// TODO write scan for specific types, don't leak redis specifics outside
// package

// use context to prevent duplicate cache hits in same request

func tenantFromContext(ctx context.Context) (Tenant, bool) {
    var tenant Tenant
    value := ctx.Value(TENANT)
    if value != nil {
        tenant = value.(Tenant)
        return tenant, true
    }
    return tenant, false
}

func appFromContext(ctx context.Context) (App, bool) {
    var app App
    value := ctx.Value(APP)
    if value != nil {
        app = value.(App)
        return app, true
    }
    return app, false
}

func productFromContext(ctx context.Context) (Product, bool) {
    var product Product
    value := ctx.Value(PRODUCT)
    if value != nil {
        product = value.(Product)
        return product, true
    }
    return product, false
}
