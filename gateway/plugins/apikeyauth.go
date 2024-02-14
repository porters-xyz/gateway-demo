package plugins

// Checks API key and rejects if not valid
// Implements Filter interface

import (
    "fmt"
    "context"
    "log"
    "net/http"
    "porters/db"
    "porters/proxy"
)

type ApiKeyAuth struct {
    ApiKeyName string
}

func (a ApiKeyAuth) Name() string {
    return "API Key Auth"
}

func (a ApiKeyAuth) Load() {
    // load plugin
    fmt.Println("loading", a.Name())
}

func (a ApiKeyAuth) Key() string {
    return "API_KEY_AUTH"
}

func (a ApiKeyAuth) Filter(ctx context.Context, resp http.ResponseWriter, req *http.Request) (context.Context, error) {
    // TODO this is plaintext in db now, but will need to be checked and hashed
    apiKey := req.Header.Get(a.ApiKeyName)
    // TODO remove logging
    log.Println("apikey", apiKey)
    newCtx := context.WithValue(ctx, proxy.AUTH_VAL, apiKey)

    if checksumApiKey(apiKey) {
        acct, ok := db.LookupAccount(newCtx, apiKey)
        if !ok || !db.IsValidAccount(newCtx, acct) {
            return nil, proxy.NewHTTPError(http.StatusUnauthorized)
        }
    } else {
        return nil, proxy.NewHTTPError(http.StatusUnauthorized)
    }
    lifecycle := proxy.SetStageComplete(newCtx, proxy.Auth)
    return lifecycle.UpdateContext(newCtx)
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
