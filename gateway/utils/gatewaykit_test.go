package utils

import (
    "net/url"
    "testing"
)

func TestPad(t *testing.T) {
    want := "0003"
    remote := url.Parse("http://test.test")
    got := NewTarget(remote, "3")
    if want != got.poktId {
        t.Fatalf(`want %s got %s`, want, got) 
    }
}
