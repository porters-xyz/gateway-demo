package proxy

// Checks API key and rejects if not valid
// Implements Filter interface

import (
    "fmt"
    "context"
    "net/http"
    "porters/db"
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
    // TODO this is plaintext in db now, but will need to be checked and hashed
    apiKey := req.Header.Get(a.ApiKeyName)
    continueCtx := context.WithValue(ctx, APIKey(AUTH), apiKey)

    if !checksumApiKey(apiKey) || !db.IsValidAccount(cancelCtx, apiKey) {
        resp.WriteHeader(http.StatusUnauthorized)
        cancel()
    }
    return continueCtx
}

// TODO check api key is in valid format to quickly determine errant requests
func validApiKey(apiKey string) bool {
    // TODO add other checks
    return checksumApiKey(apiKey)
}

// TODO implement CRC or something to quickly check api key as in spec
func checksumApiKey(apiKey string) bool {
    return true
}
