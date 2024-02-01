package db

import (
    "log"
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

    // TODO get connection string from env
    listener := pq.NewListener("postgresql://postgres@localhost:5432?sslmode=disable", 10*time.Second, 2*time.Minute, sync.eventListener)
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
        switch n.Channel {
        case "tenant_change":
            log.Println("got tenant notification", n.Extra)
        case "apikey_change":
            log.Println("got apikey notification", n.Extra)
        case "payment_tx":
            log.Println("got account credit notification", n.Extra)
        }
    case <-time.After(60 * time.Second):
        go s.listener.Ping()
    }
}
