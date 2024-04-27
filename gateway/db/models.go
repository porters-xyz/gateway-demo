package db

import (
    "context"
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

type model interface {
    Key() string
}

type fetchable interface {
    fetch(ctx context.Context) error // populate pointer with values
}

type writable interface {
    write(ctx context.Context) error // writes data at pointer to db
}

type cachable interface {
    refreshable
    cache(ctx context.Context) error // writes data to cache
    Lookup(ctx context.Context) error // read from cache w/ passthru
}

type Tenant struct {
    Id string
    Active bool
    Balance int // calculated
    CachedAt time.Time
}

type App struct {
    Id string
    Active bool
    MissedAt time.Time
    CachedAt time.Time
    Tenant Tenant
}

type Apprules []Apprule
type Apprule struct {
    Id string
    Active bool
    Value string
    CachedAt time.Time
    App App
    RuleType string
}

// tied to tenant, this isn't cached directly
// CREDIT increases balance of allowed relays
// DEBIT decreases balance (uses)
type Paymenttx struct {
    Id string
    Reference string
    Amount int
    Tenant Tenant
    TxType TxType
    CreatedAt time.Time
}

// This gets written back to postgres
// CREDIT increases number of used relays (uses)
// DEBIT decreases used relays to reconcile with payments
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
    Active bool
    Name string // subdomain on endpoint
    PoktId string // mapping on pokt network
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

func (t *Tenant) Key() string {
    return fmt.Sprintf("%s:%s", TENANT, t.Id)
}

func (a *App) Key() string {
    return fmt.Sprintf("%s:%s", APP, a.Id)
}

// Keys to a set
func (ar *Apprule) Key() string {
    return fmt.Sprintf("%s:%s:%s", APPRULE, ar.App.Id, ar.Id)
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
    return fmt.Sprintf("%s:%s", PRODUCT, p.Name)
}

func (t *Tenant) ContextKey() string {
    return TENANT
}

func (a *App) ContextKey() string {
    return APP
}

func (ar Apprules) ContextKey() string {
    return APPRULE
}

func (p *Product) ContextKey() string {
    return PRODUCT
}
