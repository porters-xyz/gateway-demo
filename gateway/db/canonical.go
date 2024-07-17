package db

import (
	"context"
	"database/sql"
	"errors"
	log "log/slog"
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
		connStr := common.GetConfig(common.DATABASE_URL)
		connector, err := pq.NewConnector(connStr)
		if err != nil {
			log.Error("Cannot connect to postgres", "err", err)
			panic("database required")
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
	query := `SELECT payment.balance - relay.usage as net FROM
    (SELECT
        COALESCE(SUM(case when "transactionType"='CREDIT' then amount else 0 end) -
            SUM(case when "transactionType"='DEBIT' then amount else 0 end), 0) 
        AS balance FROM "PaymentLedger" WHERE "tenantId" = $1) as payment,
    (SELECT
        COALESCE(SUM(case when "transactionType"='CREDIT' then amount else 0 end) -
    SUM(case when "transactionType"='DEBIT' then amount else 0 end), 0) 
        AS usage FROM "RelayLedger" WHERE "tenantId" = $1) as relay`
	row := db.QueryRowContext(ctx, query, t.Id)
	err := row.Scan(&t.Balance)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) fetch(ctx context.Context) error {
	db := getCanonicalDB()
	row := db.QueryRowContext(ctx, `SELECT id, active, "tenantId" FROM "App" WHERE id = $1 AND "deletedAt" IS NULL`, a.Id)
	err := row.Scan(&a.Id, &a.Active, &a.Tenant.Id)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) fetchRules(ctx context.Context) (Apprules, error) {
	rules := make([]Apprule, 0)
	db := getCanonicalDB()
	rows, err := db.QueryContext(ctx, `SELECT "AppRule".id, "AppRule".value, "AppRule".active, "RuleType".name FROM "AppRule", "RuleType" WHERE "AppRule"."appId" = $1 AND "AppRule"."deletedAt" IS NULL AND "RuleType".active = '1' AND "AppRule"."ruleId" = "RuleType"."id"`, a.Id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		apprule := Apprule{}
		err := rows.Scan(&apprule.Id, &apprule.Value, &apprule.Active, &apprule.RuleType)
		if err != nil {
			return nil, err
		}
		apprule.App = *a
		rules = append(rules, apprule)
	}
	return rules, nil
}

func (p *Product) fetch(ctx context.Context) error {
	db := getCanonicalDB()
	row := db.QueryRowContext(ctx, `SELECT id, name, "poktId", weight, active FROM "Products" WHERE name = $1`, p.Name)
	err := row.Scan(&p.Id, &p.Name, &p.PoktId, &p.Weight, &p.Active)
	if err != nil {
		return err
	}
	return nil
}

func (ar *Apprule) fetch(ctx context.Context) error {
	db := getCanonicalDB()
	row := db.QueryRowContext(ctx, `SELECT "AppRule".id, "AppRule".appId, "AppRule".value, "AppRule".active, "RuleType".name FROM "AppRule", "RuleType" WHERE "AppRule".id = $1 AND "AppRule"."ruleId" = "RuleType".id`, ar.Id)
	var appId string
	err := row.Scan(&ar.Id, &appId, &ar.Value, &ar.Active, &ar.RuleType)
	if err != nil {
		return err
	}
	ar.App.Id = appId
	return nil
}

func (rtx *Relaytx) write(ctx context.Context) error {
	db := getCanonicalDB()
	res, err := db.ExecContext(ctx, `INSERT INTO "RelayLedger"
        ("id", "tenantId", "referenceId", "amount", "productId", "transactionType")
        VALUES
        ($1, (SELECT "tenantId" FROM "App" WHERE id = $2), $3, $4, (SELECT id FROM "Products" WHERE name = $5), 'CREDIT')`, rtx.Id, rtx.AppId, rtx.Reference, rtx.Amount, rtx.ProductName)
	if err != nil {
		return err
	} else {
		rows, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if rows != 1 {
			return errors.New("unable to insert to RelayLedger")
		} else {
			return nil
		}
	}
}
