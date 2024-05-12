package db 

import (
    "context"
    "fmt"
    log "log/slog"
    "strconv"
    "sync"
    "time"

    "github.com/google/uuid"
    "github.com/redis/go-redis/v9"
    rl "github.com/go-redis/redis_rate/v10"

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

type Incrementable interface {
    Key() string
    Field() string
}

type Decrementable interface {
    Key() string
    Field() string
}

var client *redis.Client
var redisMutex sync.Once

func getCache() *redis.Client {
    redisMutex.Do(func() {
        // TODO figure out which redis instance to connect to
        opts, err := redis.ParseURL(common.GetConfig(common.REDIS_URL))
        if err != nil {
            log.Warn("valid REDIS_URL not provided", "err", err)
            opts = &redis.Options{
                Addr: common.GetConfig(common.REDIS_ADDR),
                Username: common.GetConfig(common.REDIS_USER),
                Password: common.GetConfig(common.REDIS_PASSWORD),
                DB: 0,
            }
        }
        client = redis.NewClient(opts)
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
        "appId", ar.App.Id,
        "ruleType", ar.RuleType,
        "cachedAt", time.Now()).Err()
    if err != nil {
        // TODO handle errors correctly
        return err
    }
    return nil
}

func (p *Product) cache(ctx context.Context) error {
    err := getCache().HSet(ctx, p.Key(),
        "poktId", p.PoktId,
        "weight", p.Weight,
        "active", p.Active,
        "cachedAt", time.Now(),
        "missedAt", p.MissedAt).Err()
    if err != nil {
        // TODO handle error here rather than return it
        return err
    }
    return nil
}

func (t *Tenant) Lookup(ctx context.Context) error {
    fromContext, ok := common.FromContext(ctx, TENANT)
    if ok {
        *t = *fromContext.(*Tenant)
    } else {
        key := t.Key()
        result, err := getCache().HGetAll(ctx, key).Result()
        // TODO errors should probably cause postgres lookup
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Debug("tenant cache expired", "key", key)
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
    fromContext, ok := common.FromContext(ctx, APP)
    if ok {
        *a = *fromContext.(*App)
    } else {
        key := a.Key()
        result, err := getCache().HGetAll(ctx, key).Result()
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Debug("missed app", "appkey", key)
            a.refresh(ctx)
        } else if result["missedAt"] != MISSED_FALSE {
            if backoff(result["missedAt"]) {
                // NOOP
            } else {
                a.refresh(ctx)
            }
        } else {
            log.Debug("got app", a.HashId())
            a.Active, _ = strconv.ParseBool(result["active"])
            a.Tenant.Id = result["tenant"]
            a.Tenant.Lookup(ctx)
        }
        common.UpdateContext(ctx, a)
    }
    return nil
}

func (a *App) Rules(ctx context.Context) (Apprules, error) {
    rules := make([]Apprule, 0)
    pattern := fmt.Sprintf("%s:%s", APPRULE, a.Id)

    // TODO check whether cache needs refresh
    iter := ScanKeys(ctx, pattern)
    for iter.Next(ctx) {
        key := iter.Val()
        result, err := getCache().HGetAll(ctx, key).Result()
        if err != nil {
            log.Error("error during scan", "err", err)
            continue
        }
        id := key // TODO extract id from key
        active, _ := strconv.ParseBool(result["active"])
        cachedAt, _ := time.Parse(time.RFC3339, result["cachedAt"])
        ar := Apprule{
            Id: id,
            Active: active,
            Value: result["value"],
            RuleType: result["ruleType"],
            CachedAt: cachedAt,
        }
        rules = append(rules, ar)
    }
    return rules, nil
}

// Lookup by name, p should have a valid "Name" set before lookup
func (p *Product) Lookup(ctx context.Context) error {
    fromContext, ok := common.FromContext(ctx, PRODUCT)
    if ok {
        *p = *fromContext.(*Product)
    } else {
        key := p.Key()
        log.Debug("finding product from cache", "prodkey", key)
        result, err := getCache().HGetAll(ctx, key).Result()
        if err != nil || len(result) == 0 || expired(result["cachedAt"]) {
            log.Debug("missed product", "prodkey", key)
            p.refresh(ctx)
        } else if result["missedAt"] != MISSED_FALSE {
            if backoff(result["missedAt"]) {
                // NOOP
            } else {
                p.refresh(ctx)
            }
        } else {
            p.PoktId, _ = result["poktId"]
            p.Weight, _ = strconv.Atoi(result["weight"])
            p.Active, _ = strconv.ParseBool(result["active"])
        }
    }
    return nil
}

func RelaytxFromKey(ctx context.Context, key string) (*Relaytx, bool) {
    relaycount := GetIntVal(ctx, key)
    rtx := reverseRelaytxKey(key)
    if relaycount > 0 && rtx.AppId != "" && rtx.ProductName != "" {
        uuid := uuid.New()
        rtx.Id = uuid.String()
        rtx.Reference = uuid.String()
        rtx.Amount = relaycount
        rtx.TxType = Credit
        return rtx, true
    }
    return rtx, false
}

// Refresh does the psql calls to build cache
func (t *Tenant) refresh(ctx context.Context) {
    err := t.fetch(ctx)
    if err != nil {
        log.Error("something's wrong", "tenant", t.Id, "err", err)
        // TODO how do we handle this?
    } else {
        err := t.canonicalBalance(ctx)
        if err != nil {
            log.Error("error getting balance", "tenant", t.Id, "err", err)
        }
        t.cache(ctx)
    }
}

func (a *App) refresh(ctx context.Context) {
    err := a.fetch(ctx)
    if err != nil {
        log.Error("err seen refreshing app", "app", a.HashId(), "err", err)
        a.MissedAt = time.Now()
    } else {
        a.Tenant.Lookup(ctx)
    }
    a.cache(ctx)

    rules, err := a.fetchRules(ctx)
    if err != nil {
        log.Error("error accessing rules", "app", a.HashId(), "err", err)
        return
    }
    for _, r := range rules {
        r.cache(ctx)
    }
}

func (p *Product) refresh(ctx context.Context) {
    err := p.fetch(ctx)
    if err != nil {
        log.Error("err getting product", "product", p.Name, "err", err)
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

// Products rarely change, hourly is ok
func (p *Product) refreshAt() time.Time {
    return p.CachedAt.Add(1 * time.Hour)
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

func IncrementField(ctx context.Context, incr Incrementable, amount int) int {
    incrBy := int64(amount)
    newVal, err := getCache().HIncrBy(ctx, incr.Key(), incr.Field(), incrBy).Result()
    if err != nil {
        // TODO do something with error
    }
    return int(newVal)
}

func DecrementField(ctx context.Context, decr Decrementable, amount int) int {
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
    return getCache().SetNX(ctx, key, initValue, 2 * time.Minute).Result()
}

func ReconcileRelays(ctx context.Context, rtx *Relaytx) (func() bool, error) {
    // Can ignore new value
    _, err := getCache().DecrBy(ctx, rtx.Key(), int64(rtx.Amount)).Result()
    if err != nil {
        return func() bool {return false}, err
    }

    updateFunc := func() bool {
        background := context.Background()
        pgerr := rtx.write(background)
        if pgerr != nil {
           log.Error("couldn't write relaytx", "pgerr", pgerr)
           return false
        }
        return true
    }
    return updateFunc, nil
}

func ScanKeys(ctx context.Context, key string) *redis.ScanIterator {
    scankey := fmt.Sprintf("%s:*", key)
    iter := getCache().Scan(ctx, 0, scankey, 0).Iterator()
    return iter
}

func Limiter() *rl.Limiter {
    rdb := getCache()
    return rl.NewLimiter(rdb)
}
