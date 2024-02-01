package db 

import (
    "context"
    "fmt"
    "strconv"
)

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
    key := "QUOTA:" + account
    intval := GetIntVal(ctx, key)
    return intval > 0
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
