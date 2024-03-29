package plugins

// Checks API key and rejects if not valid
// Implements Filter interface

import (
    "context"
    "log"
    "net/http"

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
    log.Println("loading", a.Name())
}

func (a ApiKeyAuth) Key() string {
    return "API_KEY_AUTH"
}

func (a ApiKeyAuth) HandleRequest(req *http.Request) {
    apiKey := req.Header.Get(a.ApiKeyName)
    // TODO remove logging
    log.Println("apikey", apiKey)
    newCtx := context.WithValue(req.Context(), proxy.AUTH_VAL, apiKey)

    if validApiKey(apiKey) {
        // TODO get app id from ctx
        // TODO check api key is active
        //acct, ok := db.LookupAccount(newCtx, apiKey)
        //if !ok || !db.IsValidAccount(newCtx, acct) {
            // returning without updating 
            //return
        //}
    } else {
        return
    }
    lifecycle := proxy.SetStageComplete(newCtx, proxy.Auth)
    newCtx = lifecycle.UpdateContext(newCtx)
    *req = *req.WithContext(newCtx)
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
