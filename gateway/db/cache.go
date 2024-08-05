package db

import (
	"context"
	"errors"
	"fmt"
	log "log/slog"
	"porters/common"
	"strconv"
	"strings"
	"sync"
	"time"

	rl "github.com/go-redis/redis_rate/v10"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const (
	ACCOUNT_SET  = "VALID_ACCOUNTS"
	REDIS        = "redis"
	MISSED_FALSE = "0001-01-01T00:00:00Z"
)

// access redis functions through this object
type Cache struct {
}

type RefreshTask struct {
	ref refreshable
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
		opts, err := redis.ParseURL(common.GetConfig(common.REDIS_URL))
		if err != nil {
			log.Warn("valid REDIS_URL not provided", "err", err)
			opts = &redis.Options{
				Addr:     common.GetConfig(common.REDIS_ADDR),
				Username: common.GetConfig(common.REDIS_USER),
				Password: common.GetConfig(common.REDIS_PASSWORD),
				DB:       0,
			}
		}
		client = redis.NewClient(opts)
	})
	return client
}

func needsRefresh(r refreshable) bool {
	return r.refreshAt().Compare(time.Now()) > 0
}

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
	cached := time.Now()
	err := getCache().HSet(ctx, t.Key(),
		"active", t.Active,
		"balance", t.Balance,
		"cachedAt", cached).Err()
	if err != nil {
		return err
	}
	return nil
}

func (a *App) cache(ctx context.Context) error {
	cached := time.Now()
	err := getCache().HSet(ctx, a.Key(),
		"active", a.Active,
		"tenant", a.Tenant.Id,
		"cachedAt", cached,
		"missedAt", a.MissedAt).Err()
	if err != nil {
		return err
	}
	return nil
}

func (ar *Apprule) cache(ctx context.Context) error {
	err := getCache().HSet(ctx, ar.Key(),
		"active", ar.Active,
		"value", ar.Value,
		"appId", ar.App.Id,
		"ruleType", ar.RuleType,
		"cachedAt", time.Now()).Err()
	if err != nil {
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
		return err
	}
	return nil
}

func (t *Tenant) Lookup(ctx context.Context) (context.Context, error) {
	fromContext, ok := common.FromContext(ctx, TENANT)
	if ok {
		log.Debug("Retrieving Tenant from context", "t", t)
		*t = *fromContext.(*Tenant)
	} else {
		log.Debug("Tenant not in context, retrieving from cache or db", "t", t)
		key := t.Key()
		result, err := getCache().HGetAll(ctx, key).Result()
		if err != nil || len(result) == 0 {
			log.Debug("tenant cache missing", "key", key)
			t.refresh(ctx)
		} else {
			t.Active, _ = strconv.ParseBool(result["active"])
			t.Balance, _ = strconv.Atoi(result["balance"])

			//We have to do this because in an older version some redis keys were "cached" not "cachedAt" due to a bug
			if cachedAtStr := result["cachedAt"]; cachedAtStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedAtStr)
				if err != nil {
					log.Error("Failed to parse cachedAt date", "tenantId", t.Id, "error", err)
				} else {
					t.CachedAt = cachedAt
				}
			} else if cachedStr := result["cached"]; cachedStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedStr)
				if err != nil {
					log.Error("Failed to parse cached date", "tenantId", t.Id, "error", err)
				} else {
					t.CachedAt = cachedAt
				}
			}
		}

		ctx = common.UpdateContext(ctx, t)

		if expired(t) {
			log.Debug("Tenant cache expired. Queing refresh", "tenantId", t.Id)
			common.GetTaskQueue().Add(&RefreshTask{
				ref: t,
			})
		}
	}

	return ctx, nil
}

func (a *App) Lookup(ctx context.Context) (context.Context, error) {
	fromContext, ok := common.FromContext(ctx, APP)
	if ok {
		*a = *fromContext.(*App)
	} else {
		key := a.Key()
		result, err := getCache().HGetAll(ctx, key).Result()
		if err != nil || len(result) == 0 {
			log.Debug("missed app", "appkey", key)
			a.refresh(ctx)
		} else if result["missedAt"] != MISSED_FALSE {
			if backoff(result["missedAt"]) {
				// NOOP
			} else {
				a.refresh(ctx)
			}
		} else {
			log.Debug("got app from cache", "app", a.HashId())
			a.Active, _ = strconv.ParseBool(result["active"])

			//We have to do this because in an older version some redis keys were "cached" not "cachedAt" due to a bug
			if cachedAtStr := result["cachedAt"]; cachedAtStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedAtStr)
				if err != nil {
					log.Error("Failed to parse cachedAt date", "appId", a.Id, "error", err)
				} else {
					a.CachedAt = cachedAt
				}
			} else if cachedStr := result["cached"]; cachedStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedStr)
				if err != nil {
					log.Error("Failed to parse cached date", "appId", a.Id, "error", err)
				} else {
					a.CachedAt = cachedAt
				}
			}

			a.Tenant.Id = result["tenant"]

			log.Debug("Updating Tenant via Lookup")
			ctx, _ = a.Tenant.Lookup(ctx)
		}

		log.Debug("Setting App context", "appId", a.Id)
		ctx = common.UpdateContext(ctx, a)

		if expired(a) {
			log.Debug("App cache expired. Refreshing", "appId", a.Id)
			common.GetTaskQueue().Add(&RefreshTask{
				ref: a,
			})
		}
	}
	return ctx, nil
}

func (a *App) Rules(ctx context.Context) (Apprules, error) {
	rules := make([]Apprule, 0)
	pattern := fmt.Sprintf("%s:%s", APPRULE, a.Id)

	iter := ScanKeys(ctx, pattern)
	for iter.Next(ctx) {
		key := iter.Val()
		result, err := getCache().HGetAll(ctx, key).Result()
		if err != nil {
			log.Error("error during scan", "err", err)
			continue
		}

		// Extract the actual ID from the Redis key
		parts := strings.Split(key, ":")
		if len(parts) != 3 || parts[0] != APPRULE {
			log.Error("Invalid key format", "key", key)
			continue
		}
		appId := parts[1]
		appRuleId := parts[2]

		active, _ := strconv.ParseBool(result["active"])
		cachedAt, _ := time.Parse(time.RFC3339, result["cachedAt"])
		ar := Apprule{
			Id:       appRuleId,
			Active:   active,
			Value:    result["value"],
			RuleType: result["ruleType"],
			CachedAt: cachedAt,
			App:      App{Id: appId},
		}

		// Check if the Apprule needs to be refreshed
		if expired(&ar) {
			log.Debug("Apprule cache is expired. Refreshing", "apprule", ar.Id)
			common.GetTaskQueue().Add(&RefreshTask{
				ref: &ar,
			})
		}

		rules = append(rules, ar)
	}
	return rules, nil
}

// Lookup by name, p should have a valid "Name" set before lookup
func (p *Product) Lookup(ctx context.Context) (context.Context, error) {
	fromContext, ok := common.FromContext(ctx, PRODUCT)
	if ok {
		*p = *fromContext.(*Product)
	} else {
		key := p.Key()
		log.Debug("finding product from cache", "prodkey", key)
		result, err := getCache().HGetAll(ctx, key).Result()
		if err != nil || len(result) == 0 {
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

			//We have to do this because in an older version some redis keys were "cached" not "cachedAt" due to a bug
			if cachedAtStr := result["cachedAt"]; cachedAtStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedAtStr)
				if err != nil {
					log.Error("Failed to parse cachedAt product", "product", p.Id, "error", err)
				} else {
					p.CachedAt = cachedAt
				}
			} else if cachedStr := result["cached"]; cachedStr != "" {
				cachedAt, err := time.Parse(time.RFC3339, cachedStr)
				if err != nil {
					log.Error("Failed to parse cached product", "product", p.Id, "error", err)
				} else {
					p.CachedAt = cachedAt
				}
			}
		}

		log.Debug("Setting Product context", "productId", p.Id)
		ctx = common.UpdateContext(ctx, p)

		if expired(p) {
			log.Debug("Product cache expired. Refreshing", "productId", p.Id)
			common.GetTaskQueue().Add(&RefreshTask{
				ref: p,
			})
		}
	}
	return ctx, nil
}

func RelaytxFromKey(ctx context.Context, key string) (*Relaytx, bool) {
	relaycount := GetIntVal(ctx, key)
	log.Debug("RelaytxFromKey, Relay count", "relaycount", relaycount)

	rtx := reverseRelaytxKey(key)
	log.Debug("Reverse relay key", "rtx", rtx)

	log.Debug("AppId", "AppId", rtx.AppId)
	log.Debug("ProductName", "ProductName", rtx.ProductName)

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
func (t *Tenant) refresh(ctx context.Context) error {
	log.Debug("Refreshing tenant", "tenantId", t.Id)
	err := t.fetch(ctx)
	if err != nil {
		log.Error("Failed to fetch tenant", "tenantId", t.Id, "error", err)
		return err
	}

	err = t.canonicalBalance(ctx)
	if err != nil {
		log.Error("Failed to get canonical balance", "tenantId", t.Id, "error", err)
		return err
	}

	err = t.cache(ctx)
	if err != nil {
		log.Error("Failed to cache tenant", "tenantId", t.Id, "error", err)
		return err
	}

	return nil
}

func (a *App) refresh(ctx context.Context) error {
	if a == nil {
		log.Error("App is nil, cannot refresh")
		return errors.New("App is nil")
	}

	log.Debug("Refreshing app", "appId", a.Id)
	err := a.fetch(ctx)
	if err != nil {
		//Can be set to log.Error, but lots of false positives will show due to context cancellation
		log.Debug("Failed to fetch app", "appId", a.Id, "error", err)
		a.MissedAt = time.Now()
	} else {
		log.Debug("Updating Tenant via Lookup")
		ctx, _ = a.Tenant.Lookup(ctx)
	}

	err = a.cache(ctx)
	if err != nil {
		//Can be set to log.Error, but lots of false positives will show due to context cancellation
		log.Debug("Failed to cache app", "appId", a.Id, "error", err)
		return err
	}

	rules, err := a.fetchRules(ctx)
	if err != nil {
		log.Error("Failed to fetch rules", "appId", a.Id, "error", err)
		return err
	}
	for _, r := range rules {
		err := r.cache(ctx)
		if err != nil {
			log.Error("Failed to cache rule", "ruleId", r.Id, "error", err)
		}
	}

	return nil
}

func (ar *Apprule) refresh(ctx context.Context) error {
	err := ar.fetch(ctx)
	if err != nil {
		log.Error("error seen refreshing apprule", "apprule", ar.Id, "err", err)
		return err
	}
	ar.cache(ctx)
	return nil
}

func (p *Product) refresh(ctx context.Context) error {
	err := p.fetch(ctx)
	if err != nil {
		log.Error("err getting product", "product", p.Name, "err", err)
		p.MissedAt = time.Now()
	}
	p.cache(ctx)
	return nil
}

func (t *RefreshTask) Run() {
	log.Debug("Running refresh task", "refreshable", t.ref)
	ctx := context.Background()
	err := t.ref.refresh(ctx)
	if err != nil {
		log.Error("Failed to refresh", "error", err)
		common.GetTaskQueue().ReportError(errors.New(t.Error()))
	}
}

func (t *RefreshTask) Error() string {
	return "error processing refresh"
}

func (t *Tenant) refreshAt() time.Time {
	return t.CachedAt.Add(1 * time.Minute)
}

func (a *App) refreshAt() time.Time {
	return a.CachedAt.Add(1 * time.Minute)
}

func (ar *Apprule) refreshAt() time.Time {
	return ar.CachedAt.Add(1 * time.Minute)
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

func expired(ref refreshable) bool {
	return time.Now().After(ref.refreshAt())
}

// utility function
func GetIntVal(ctx context.Context, name string) int {
	result, err := getCache().Get(ctx, name).Result()
	if err != nil {
		return 0
	}
	intval, err := strconv.Atoi(result)
	if err != nil {
		return 0
	}
	return intval
}

func IncrementField(ctx context.Context, incr Incrementable, amount int) int {
	incrBy := int64(amount)
	newVal, err := getCache().HIncrBy(ctx, incr.Key(), incr.Field(), incrBy).Result()
	if err != nil {
		return -1
	}
	return int(newVal)
}

func DecrementField(ctx context.Context, decr Decrementable, amount int) int {
	decrBy := -int64(amount)
	newVal, err := getCache().HIncrBy(ctx, decr.Key(), decr.Field(), decrBy).Result()
	if err != nil {
		return -1
	}
	return int(newVal)
}

func IncrementCounterKey(ctx context.Context, key string, amount int) int {
	incrBy := int64(amount)
	newVal, err := getCache().IncrBy(ctx, key, incrBy).Result()
	if err != nil {
		log.Error("Error incrementing counter (key)", "key", key, "amount", amount, "error", err)
		return -1
	}
	return int(newVal)
}

func IncrementCounterField(ctx context.Context, key string, field string, amount int) int {
	incrBy := int64(amount)

	newVal, err := getCache().HIncrBy(ctx, key, field, incrBy).Result()
	if err != nil {
		log.Error("Error incrementing counter (field)", "key", key, "field", field, "amount", amount, "error", err)
		return -1
	}
	return int(newVal)
}

func DecrementCounterField(ctx context.Context, key string, field string, amount int) int {
	decrBy := int64(amount)

	newVal, err := getCache().HIncrBy(ctx, key, field, -decrBy).Result()
	if err != nil {
		log.Error("Error decrementing counter", "key", key, "field", field, "amount", amount, "error", err)
		return -1
	}
	return int(newVal)
}

func InitCounter(ctx context.Context, key string, field string, initValue int) (bool, error) {
	success, err := getCache().HSetNX(ctx, key, field, initValue).Result()
	if err != nil {
		log.Error("Error initializing counter", "key", key, "field", field, "initValue", initValue, "error", err)
		return false, err
	}
	log.Info("Initialized counter", "key", key, "field", field, "success", success)
	return success, nil
}

func ReconcileRelays(ctx context.Context, rtx *Relaytx) (func() bool, error) {
	// Can ignore new value
	_, err := getCache().DecrBy(ctx, rtx.Key(), int64(rtx.Amount)).Result()
	if err != nil {
		return func() bool { return false }, err
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
