package db 

import (
    "context"
    "fmt"
    "strconv"
)

// TODO cleanup, this moved to model.go
type Account struct {
    id string
}

func IncRelayCount(ctx context.Context, account string) {
    // TODO figure out account scheme
    _, err := getClient().Incr(ctx, account).Result()
    if err != nil {
        // TODO handle errors properly
        fmt.Println(err)
        return
    }
    return
}

// TODO remove, just for testing
func IncrCounter(ctx context.Context, name string) int64 {
    result, err := getClient().Incr(ctx, name).Result()
    if err != nil {
        // TODO handle errors properly
        return 0
    }
    return result
}

// TODO just for testing
func DecrCounter(ctx context.Context, name string) int64 {
    result, err := getClient().Decr(ctx, name).Result()
    if err != nil {
        // TODO handle errors properly
        return 0
    }
    return result
}

// Uses QUOTA to determine account existing, does not guarantee relays remaining
// TODO use tenant hash
func IsValidAccount(ctx context.Context, account string) bool {
    key := GenAccountKey(account)
    result, err := getClient().HGet(ctx, key, "enabled").Result()
    resbool, err2 := strconv.ParseBool(result)
    if err != nil || err2 != nil{
        // TODO clean this up
        resbool = false
    }
    return resbool
}

func GetIntVal(ctx context.Context, name string) int {
    result, err := getClient().Get(ctx, name).Result()
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

// TODO check redis, if missing check postgres (and cache), if neither return false
func LookupAccount(ctx context.Context, apiKey string) (Account, bool) {
    // TODO do this in tx that checks and gets account information?
    result, err := getClient().SIsMember(ctx, ACCOUNT_SET, apiKey).Result()
    if err != nil || !result {
        // TODO handle errors better
        return Account{}, false
    }
    // TODO need to grab all keys to build account
    return Account{""}, true
}

func UseRelay(ctx context.Context, apiKey string) {
    key := GenApiKey(apiKey)
    account, err := getClient().HGet(ctx, key, "account").Result()
    if err != nil {
        // TODO log error to alert, will need manual cleanup
    } else {
        acctKey := GenAccountKey(account)
        err2 := getClient().HIncrBy(ctx, acctKey, "counter", -1).Err()
        if err2 != nil {
            // TODO also clean this up, not decr'd
        }
    }
}

func HasRelays(ctx context.Context, apiKey string) bool {
    key := GenApiKey(apiKey)
    account, err := getClient().HGet(ctx, key, "account").Result()
    if err != nil {
        // TODO account issues need to be handled
    } else {
        acctKey := GenAccountKey(account)
        remainder, err2 := getClient().HGet(ctx, acctKey, "counter").Result()
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
