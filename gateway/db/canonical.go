package db

import (
    "context"
    "database/sql"
    "errors"
    "log"
    "os"
    "sync"

    "github.com/lib/pq"

    "porters/common"
)

// Cache sits in front of canonical db (postgres)
// Protect access to this to reduce it to minimal traffic
type DB interface {
    common.HealthCheck
    Conn(ctx context.Context) (*sql.Conn, error)
    Report() sql.DBStats
}

type Canonical struct {
    // any instance specific stuff here
    // singleton holds 
}

type DBFunc func(*sql.Conn) error

var postgresPool *sql.DB
var postgresMutex sync.Once

func getCanonicalDB() *sql.DB {
    postgresMutex.Do(func() {
        connStr := os.Getenv("DATABASE_URL")
        connector, err := pq.NewConnector(connStr)
        if err != nil {
            // TODO handle nicely, maybe retry?
            log.Fatal(err)
        }
        postgresPool = sql.OpenDB(connector)
    })
    return postgresPool
}

// Wrapping conn function to not expose the DB outside package
func (c *Canonical) Conn(ctx context.Context) (*sql.Conn, error) {
    db := getCanonicalDB()
    return db.Conn(ctx)
}

// TODO switch this to send to prometheus
func (c *Canonical) Report() sql.DBStats {
    db := getCanonicalDB()
    return db.Stats()
}

func (c *Canonical) Healthcheck() *common.HealthCheckStatus {
    hc := common.NewHealthCheckStatus()
    db := getCanonicalDB()
    err := db.Ping()
    if err != nil {
        hc.AddError("postgres", err)
    } else {
        hc.AddHealthy("postgres", "connected")
    }
    return hc
}

func (t *Tenant) fetch(ctx context.Context) error {
    db := getCanonicalDB()
    query := `SELECT id, active FROM "Tenant" WHERE id = $1 AND "deletedAt" IS NULL`
    row := db.QueryRowContext(ctx, query, t.Id) 
    err := row.Scan(&t.Id, &t.Active)
    if err != nil {
        return err
    }
    return nil
}

// Special function on tenant to update the "official" balance
// cached balance is counted down as relays are used
// cached balance is incremented on new CREDIT txns and and needs to track last
// "createdAt"
func (t *Tenant) canonicalBalance(ctx context.Context) error {
    db := getCanonicalDB()
    query := `SELECT
    COALESCE(SUM(case when "transactionType"='CREDIT' then amount else 0 end) -
    SUM(case when "transactionType"='DEBIT' then amount else 0 end), 0) 
        AS balance FROM "PaymentLedger" WHERE "tenantId" = $1`
    row := db.QueryRowContext(ctx, query, t.Id)
    err := row.Scan(&t.Balance)
    if err != nil {
        return err
    }
    return nil
}

func (a *App) fetch(ctx context.Context) error {
    log.Println("fetching app")
    db := getCanonicalDB()
    row := db.QueryRowContext(ctx, `SELECT id, "tenantId" FROM "App" WHERE id = $1 AND "deletedAt" IS NULL`, a.Id)
    err := row.Scan(&a.Id, &a.Tenant.Id)
    if err != nil {
        return err
    }
    a.Active = true // TODO this needs to be in DB, hardcoding for now
    return nil
}

// TODO this doesn't exist in database yet, returns unimplemented for now
func (p *Product) fetch(ctx context.Context) error {
    db := getCanonicalDB()
    _ = db.QueryRowContext(ctx, `SELECT * FROM "Product" WHERE id = $1`, p.Id)
    return errors.New("unimplemented SQL table")
}

// TODO Get any credits since cached time
// TODO Need another function for getting updated balance
func (ptx *Paymenttx) fetch(ctx context.Context) error {
    //db := getCanonicalDB()
    //row := db.QueryRowContext(ctx)
    return nil
}

// TODO we might just write this.
func (rtx *Relaytx) fetch(ctx context.Context) error {
    db := getCanonicalDB()
    row := db.QueryRowContext(ctx, `SELECT id FROM "RelayLedger" WHERE id = $1`, rtx.Id)
    err := row.Scan()
    if err != nil {
        return err
    }
    return nil

}

func (rtx *Relaytx) write(ctx context.Context) error {
    // TODO write DEBITS to postgres
    return nil
}
