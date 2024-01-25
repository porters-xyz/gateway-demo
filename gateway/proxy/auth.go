package proxy

// Checks API key and rejects if not valid
// Implements Filter interface

import (
    "fmt"
    "context"
    "net/http"
)

const AUTH = "AUTH"

type APIKey string
type Auth struct {
    ApiKeyName string
}

func (a Auth) Name() string {
    return "API Key Auth"
}

func (a Auth) Load() {
    // load plugin
    fmt.Println("loading", a.Name())
}

func (a Auth) Key() string {
    return AUTH
}

func (a Auth) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) context.Context{
    cancelCtx, cancel := context.WithCancel(ctx)
    apiKey := req.Header.Get(a.ApiKeyName)
    continueCtx := context.WithValue(ctx, APIKey(AUTH), apiKey)

    // TODO this might actually mean out of relays
    valid := IsValidAccount(cancelCtx, apiKey)
    if !valid {
        resp.WriteHeader(http.StatusUnauthorized)
        cancel()
    }
    return continueCtx
}
