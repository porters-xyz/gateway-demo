package plugins

// Checks API key and rejects if not valid
// Implements Filter interface

import (
    "context"
    log "log/slog"
    "net/http"

    "porters/common"
    "porters/db"
    "porters/proxy"
    "porters/utils"
)

type ApiKeyAuth struct {
    ApiKeyName string
}

func (a *ApiKeyAuth) Name() string {
    return "API Key Auth"
}

func (a *ApiKeyAuth) Load() {
    // load plugin
    log.Debug("loading plugin", "plugin", a.Name())
}

func (a *ApiKeyAuth) Key() string {
    return "API_KEY_AUTH"
}

func (a *ApiKeyAuth) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    apiKey := req.Header.Get(a.ApiKeyName)
    newCtx := context.WithValue(req.Context(), proxy.AUTH_VAL, apiKey)

    if validApiKey(apiKey) {
        appId := proxy.PluckAppId(req)
        app := &db.App{Id: appId}
        err := app.Lookup(ctx)
        if err != nil {
            return proxy.NewHTTPError(http.StatusBadGateway)
        }

        hashedKey := utils.Hash(apiKey)
        rules := a.getRulesForScope(ctx, app)
        success := (len(rules) == 0)

        for _, rule := range rules {
            if hashedKey == rule {
                success = true
                break
            }
        }
        if success {
            lifecycle := proxy.SetStageComplete(newCtx, proxy.Auth)
            newCtx = common.UpdateContext(newCtx, lifecycle)
            *req = *req.WithContext(newCtx)
            return nil
        }
    } else {
        return proxy.APIKeyInvalidError
    }
    return proxy.APIKeyInvalidError
}

func (a *ApiKeyAuth) getRulesForScope(ctx context.Context, app *db.App) []string {
    apirules := make([]string, 0)
    rules, err := app.Rules(ctx)
    if err != nil {
        log.Error("error getting rules", "app", app.HashId(), "err", err)
    } else {
        for _, rule := range rules {
            if rule.RuleType != "secret-key" || !rule.Active {
                continue
            }
            apirules = append(apirules, rule.Value)
        }
    }
    return apirules
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

