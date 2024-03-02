package db

import (
    "fmt"
    "strings"
)

const (
    TENANT string = "TENANT"
    APP           = "APP"
    APPRULE       = "APPRULE"
    PAYMENTTX     = "PAYMENTTX"
    USAGETX       = "USAGETX"
    PRODUCTCTR    = "PRODUCTCTR"
)

type tenant struct {
    id string
    active bool

    // counters
    balanceSettled int
    balanceActive int
}

type app struct {
    id string
    active bool
    tenant tenant

    // counters
    requested int
    success int
    failure int
}

type appRule struct {
    id string
    appId string
    active bool
    ruleType ruleType
}

type ruleType struct {
    id string
    name string
    active bool
}

type paymentTx struct {
    id string
    tenantId string
    reference string
    amount int
    txType TxType
}

type usageTx struct {
    id string
    tenantId string
    reference string
    amount int
    prodId string
    txType TxType
}

// Allow multiple names for same underlying product
type product struct {
    id string
    name string // subdomain on endpoint
    num int // optional (for evm chain)
    weight int
}

type productCounter struct {
    app app
    product product

    // counters
    requested int
    success int
    failure int
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

func (t *tenant) Key() string {
    return fmt.Sprintf("%s:%s", TENANT, t.id)
}

func (a *app) Key() string {
    return fmt.Sprintf("%s:%s", APP, a.id)
}

// TODO placeholder for when relays are tracked per "chain"
func (p *productCounter) Key() string {
    return fmt.Sprintf("%s:%s:%s", PRODUCTCTR, p.app.id, p.product.id)
}
