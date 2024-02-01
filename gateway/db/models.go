package db

import (
    "context"
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
}

type paymentTx struct {
    tenantId string
    amount int
    txType TxType 
}

type TxType int
const (
    Credit TxType = iota
    Debit
)


func (t *tenant) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
    err := getClient().HSet(ctx, genAccountKey(t.id), "enabled", t.enabled, "balance", t.balanceSettled).Err()
    if err != nil {
        // TODO handle errors should they happen
    }
    // Only set the counter if it isn't active (hasn't been set)
    err = getClient().HSetNX(ctx, genAccountKey(t.id), "counter", t.balanceSettled).Err()
    if err != nil {
        // TODO handle errors should they happen
    }

}

func (a *apiKey) writeToCache(ctx context.Context) {
    // TODO call redis create with key format
}

func (p *paymentTx) writeToCache(ctx context.Context) {
    var err error
    if p.txType == Credit {
        err = getClient().HIncrBy(ctx, genAccountKey(p.tenantId), "balance", int64(p.amount)).Err()
    } else {
        err = getClient().HIncrBy(ctx, genAccountKey(p.tenantId), "balance", -int64(p.amount)).Err()
    }
    if err != nil {
        // TODO handle errors should they happen
    }
}

func genAccountKey(tenantId string) string {
     return "ACCOUNT:" + tenantId
}
