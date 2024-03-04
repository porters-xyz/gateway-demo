package db

import (
    "fmt"
    "strings"
    "time"
)

const (
    TENANT string = "TENANT"
    APP           = "APP"
    APPRULE       = "APPRULE"
    RULETYPE      = "RULETYPE"
    PAYMENTTX     = "PAYMENTTX"
    RELAYTX       = "RELAYTX"
    PRODUCT       = "PRODUCT"
)

type tenant struct {
    id string
    active bool
    cached time.Time
}

type app struct {
    id string
    active bool
    missed time.Time 
    cached time.Time
    tenant tenant
}

type apprule struct {
    id string
    active bool
    value string
    cached time.Time
    app app
    ruleType ruletype
}

type ruletype struct {
    id string
    name string
    active bool
}

type paymenttx struct {
    id string
    reference string
    amount int
    tenant tenant
    txType TxType
}

// This gets written back to postgres
type relaytx struct {
    id string
    reference string
    amount int
    product product
    tenant tenant
    txType TxType
}

// Allow multiple names for same underlying product
type product struct {
    id string
    name string // subdomain on endpoint
    num int // optional (for evm chain)
    weight int
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
    } else {
        return Unknown
    }
}

func (t *tenant) Key() string {
    return fmt.Sprintf("%s:%s", TENANT, t.id)
}

func (a *app) Key() string {
    return fmt.Sprintf("%s:%s", APP, a.id)
}

// Keys to a set
func (ar *apprule) Key() string {
    return fmt.Sprintf("%s:%s", APPRULE, ar.app.id)
}

func (rt *ruletype) Key() string {
    return fmt.Sprintf("%s:%s", RULETYPE, rt.id)
}

// TODO is this needed?
func (p *paymenttx) Key() string {
   return "" 
}

// TODO sort out how this is used
func (r *relaytx) Key() string {
    return fmt.Sprintf("%s:%s", RELAYTX, r.id)
}

func (p *product) Key() string {
    return fmt.Sprintf("%s:%s", PRODUCT, p.id)
}
