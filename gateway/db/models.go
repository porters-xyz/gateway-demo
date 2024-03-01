package db

import (
    "strings"
)

const (
    TENANT string = "TENANT"
    APP           = "APP"
    
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

func GenAccountKey(tenantId string) string {
    return "ACCOUNT:" + tenantId
}

func GenApiKey(apiKey string) string {
    return "APIKEY:" + apiKey + ":meta"
}

// TODO placeholder for when relays are tracked per "chain"
func GenChainKey(apiKey string, chainId string) string {
    return "APIKEY:" + apiKey + ":" + chainId
}
