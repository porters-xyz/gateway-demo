package db

import (
    "context"
    "database/sql"
    "log"
    "os"
    "sync"

    "github.com/lib/pq"

    "porters/common"
)

// Cache sits in front of canonical db (postgres)
// Protect access to this to reduce it to minimal traffic
type Canonical struct {

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
func Conn(ctx context.Context) (*sql.Conn, error) {
    db := getCanonicalDB()
    return db.Conn(ctx)
}

// TODO switch this to send to prometheus
func Report() sql.DBStats {
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
