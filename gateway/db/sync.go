package db

import (
    "context"
    "log"
    "os"
    "strings"
    "strconv"
    "sync"
    "time"

    "github.com/lib/pq"
)

type Sync struct {
    listener *pq.Listener
    failed chan error
}

func ConnectSync() *Sync {
    sync := &Sync{
        failed: make(chan error, 2),
    }

    connStr := os.Getenv("DATABASE_URL")
    log.Println("db:", connStr)
    listener := pq.NewListener(connStr, 10*time.Second, 2*time.Minute, sync.eventListener)
    sync.listener = listener

    return sync
}

func (s *Sync) Close() {
    s.listener.Close()
}

func (s *Sync) Listen(event string, wg *sync.WaitGroup) {
    defer wg.Done()

    err := s.listener.Listen(event)

    // TODO another error handler to figure out
    if err != nil {
        log.Println("cannot listen", err)
    }

    for {
        s.notify()
    }
}

func (s *Sync) eventListener(event pq.ListenerEventType, err error) {
    if err != nil {
        log.Println("listener error", err)
    }
    if event == pq.ListenerEventConnectionAttemptFailed {
        s.failed <- err
    }
}

func (s *Sync) notify() {
    select {
    case n := <-s.listener.Notify:
        // do the thing
        log.Println("got event", n)
        ctx := context.TODO()
        switch n.Channel {
        case "tenant_change":
            log.Println("got tenant notification", n.Extra)
            populateTenant(n.Extra).writeToCache(ctx)
        case "apikey_change":
            log.Println("got apikey notification", n.Extra)
            populateApiKey(n.Extra).writeToCache(ctx)
        case "payment_tx":
            log.Println("got account credit notification", n.Extra)
            populatePaymentTx(n.Extra).writeToCache(ctx)
        }
    case <-time.After(60 * time.Second):
        go s.listener.Ping()
    }
}

func populateTenant(seed string) *tenant {
    parts := strings.Split(seed, ",")
    t := &tenant{id: parts[0], enabled: parts[1] == "true"}
    // TODO optionally add balances from calc on ledger
    return t
}

func populateApiKey(seed string) *apiKey {
    parts := strings.Split(seed, ",")
    // unused parts[2] appId
    a := &apiKey{key: parts[0], tenantId: parts[1], enabled: parts[3] == "true"}
    return a
}

func populatePaymentTx(seed string) *paymentTx {
    parts := strings.Split(seed, ",")
    amount, err := strconv.Atoi(parts[1])
    if err != nil {
        // TODO log error, something is going wrong, cache may be inaccurate
        amount = 0
    }
    p := &paymentTx{tenantId: parts[0], amount: amount, txType: parseTxType(parts[2])}
    return p
}
