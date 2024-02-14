package db

import (
    "context"
    "porters/utils"
    "strings"
)

type tenant struct {
    id string
    enabled bool
    balanceSettled int
    balanceActive int
}

type apiKey struct {
    key string
    enabled bool
    tenantId string
    chainId string
}

type paymentTx struct {
    tenantId string
    amount int
    txType TxType
}

// Unknown is basically error, shouldn't rely on it
type TxType int
const (
    Credit TxType = iota
    Debit
    Unknown
)

func parseTxType(str string) TxType {
    if strings.EqualFold(str, "CREDIT") {
        return Credit
    } else if strings.EqualFold(str, "DEBIT") {
        return Debit
    }else {
        return Unknown
    }
}

func (t *tenant) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
    err := getClient().HSet(ctx, GenAccountKey(t.id), "enabled", t.enabled).Err()
    if err != nil {
        // TODO handle errors should they happen
    }
}

func (a *apiKey) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
    err := getClient().HSet(ctx, GenApiKey(a.key), "account", a.tenantId, "enabled", a.enabled).Err()
    if err != nil {
        // TODO handle errors correctly
    }
}

func (p *paymentTx) writeToCache(ctx context.Context) {
    var err error
    if p.txType == Credit {
        err = getClient().HIncrBy(ctx, GenAccountKey(p.tenantId), "cached_remaining", int64(p.amount)).Err()
        if err != nil {
            // TODO handle errors should they happen
        }
        err = getClient().HIncrBy(ctx, GenAccountKey(p.tenantId), "relays_remaining", int64(p.amount)).Err()
    } else {
        err = getClient().HIncrBy(ctx, GenAccountKey(p.tenantId), "cached_remaining", -int64(p.amount)).Err()
    }
    if err != nil {
        // TODO handle errors should they happen
    }
}

func GenAccountKey(tenantId string) string {
    return "ACCOUNT:" + tenantId
}

func GenApiKey(apiKey string) string {
    hashedKey := utils.Hash(apiKey)
    return "APIKEY:" + hashedKey + ":meta"
}

// TODO placeholder for when relays are tracked per "chain"
func GenChainKey(apiKey string, chainId string) string {
    hashedKey := utils.Hash(apiKey)
    return "APIKEY:" + hashedKey + ":" + chainId
}
