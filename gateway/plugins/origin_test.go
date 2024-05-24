package plugins

import (
    "testing"
)

func TestAllowedOriginMatches(t *testing.T) {
    want := true
    origin := "http://test.com"
    allowed := []string{"http://test2.com", "http://test.com"}
    filter := &AllowedOriginFilter{}
    got := filter.matchesRules(origin, allowed)
    if want != got {
        t.Fatal("origin doesn't match")
    }
}

func TestAllowedOriginMismatch(t *testing.T) {
    want := false
    origin := "http://test3.com"
    allowed := []string{"http://test2.com", "http://test.com"}
    filter := &AllowedOriginFilter{}
    got := filter.matchesRules(origin, allowed)
    if want != got {
        t.Fatal("origin doesn't match")
    }
}
