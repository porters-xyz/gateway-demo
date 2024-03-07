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

type Tenant struct {
    Id string
    Active bool
    Balance int // calculated
    CachedBalance int // not-persisted
    CachedAt time.Time
}

type App struct {
    Id string
    Active bool
    MissedAt time.Time
    CachedAt time.Time
    Tenant Tenant
}

type Apprule struct {
    Id string
    Active bool
    Value string
    CachedAt time.Time
    App App
    RuleType Ruletype
}

type Ruletype struct {
    Id string
    Name string
    Active bool
}

// tied to tenant, this isn't cached directly
type Paymenttx struct {
    Id string
    Reference string
    Amount int
    Tenant Tenant
    TxType TxType
    CreatedAt time.Time
}

// This gets written back to postgres
type Relaytx struct {
    Id string
    Reference string
    Amount int
    Product Product
    Tenant Tenant
    TxType TxType
}

// TODO this needs to be added to postgres schema
// Allow multiple names for same underlying product
// product miss means subdomain on endpoint doesn't match known product
type Product struct {
    Id string
    Name string // subdomain on endpoint
    Num int // optional (for evm chain)
    Weight int
    MissedAt time.Time
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

func NewTenant(id string) Tenant {
    return Tenant{
        Id: id,
    }
}

func NewApp(id string) App {
    return App{
        Id: id,
    }
}

func (t *Tenant) Key() string {
    return fmt.Sprintf("%s:%s", TENANT, t.Id)
}

func (a *App) Key() string {
    return fmt.Sprintf("%s:%s", APP, a.Id)
}

// Keys to a set
func (ar *Apprule) Key() string {
    return fmt.Sprintf("%s:%s", APPRULE, ar.App.Id)
}

func (rt *Ruletype) Key() string {
    return fmt.Sprintf("%s:%s", RULETYPE, rt.Id)
}

// TODO is this needed?
func (p *Paymenttx) Key() string {
   return "" 
}

// TODO sort out how this is used
func (r *Relaytx) Key() string {
    return fmt.Sprintf("%s:%s", RELAYTX, r.Id)
}

func (p *Product) Key() string {
    return fmt.Sprintf("%s:%s", PRODUCT, p.Id)
}
