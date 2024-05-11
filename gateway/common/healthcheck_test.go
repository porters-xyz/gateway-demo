package common

import (
    "errors"
    "testing"
)

// normal report healthy
func TestHealthy(t *testing.T) {
    wantState := 1
    wantMsg := "all good"
    hcs := NewHealthCheckStatus()
    hcs.AddHealthy("test", "all good")
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err != nil {
        t.Fatal("got error", err)
    }
}

func TestCaution(t *testing.T) {
    wantState := 0
    wantMsg := "maybe ok"
    hcs := NewHealthCheckStatus()
    hcs.AddCaution("test", "maybe ok", nil)
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err != nil {
        t.Fatal("got error", err)
    }
}

func TestError(t *testing.T) {
    wantState := -1
    wantMsg := "bad"
    hcs := NewHealthCheckStatus()
    hcs.AddError("test", errors.New("bad"))
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err == nil {
        t.Fatal("expected error")
    }
}

func TestOverwriteHealthy(t *testing.T) {
    wantState := 2
    wantMsg := "all good2"
    hcs := NewHealthCheckStatus()
    hcs.AddHealthy("test", "all good")
    hcs.AddHealthy("test", "all good2")
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err != nil {
        t.Fatal("got error", err)
    }
}

func TestOverwriteCaution(t *testing.T) {
    wantState := 0
    wantMsg := "maybe2"
    hcs := NewHealthCheckStatus()
    hcs.AddCaution("test", "maybe", nil)
    hcs.AddCaution("test", "maybe2", nil)
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err != nil {
        t.Fatal("got error", err)
    }
}

func TestOvewriteError(t *testing.T) {
    wantState := -2
    wantMsg := "bad2"
    hcs := NewHealthCheckStatus()
    hcs.AddError("test", errors.New("bad1"))
    hcs.AddError("test", errors.New("bad2"))
    haveState := hcs.status["test"].State
    haveMsg := hcs.status["test"].Msg
    err := hcs.status["test"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err == nil {
        t.Fatal("expected error")
    }
}

func TestAggregate(t *testing.T) {
    wantState := 1
    wantMsg := "all good"
    parent := NewHealthCheckStatus()
    child := NewHealthCheckStatus()
    child.AddHealthy("test", "all good")
    child.AddHealthy("test2", "all good")
    parent.Aggregate(child)
    haveState := parent.status["test2"].State
    haveMsg := parent.status["test2"].Msg
    err := parent.status["test2"].Err
    if wantState != haveState {
        t.Fatalf("want %d, got %d", wantState, haveState)
    }
    if wantMsg != haveMsg {
        t.Fatalf("want %s, got %s", wantMsg, haveMsg)
    }
    if err != nil {
        t.Fatal("got error", err)
    }
}

func TestJson(t *testing.T) {
    want := `{"test":{"state":1,"message":"good"}}`
    hcs := NewHealthCheckStatus()
    hcs.AddHealthy("test", "good")
    got := hcs.ToJson()
    if want != got {
        t.Fatalf("want %s, got %s", want, got)
    }
}
