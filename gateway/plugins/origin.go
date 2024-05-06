package plugins

import (
    "context"
    "log"
    "net/http"
    "regexp"

    "porters/db"
    "porters/proxy"
)

const (
    ORIGIN_HEADER string = "Origin"
    ALLOWED_ORIGIN = "allowed-origins"
)

type AllowedOriginFilter struct {

}

func (a *AllowedOriginFilter) Name() string {
    return "Allowed Origin Filter"
}

func (a *AllowedOriginFilter) Key() string {
    return "ORIGIN"
}

func (a *AllowedOriginFilter) Load() {
    log.Println("loading", a.Name())
}

func (a *AllowedOriginFilter) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    origin := req.Header.Get(ORIGIN_HEADER)
    app := &db.App{
        Id: proxy.PluckAppId(req),
    }
    err := app.Lookup(ctx)
    if err != nil {
        return proxy.NewHTTPError(http.StatusNotFound)
    }

    rules := a.getRulesForScope(ctx, app)
    allow := (len(rules) == 0)

    for _, rule := range rules {
        if rule.MatchString(origin) {
            allow = true
            break
        }
    }

    if !allow {
        return proxy.NewHTTPError(http.StatusUnauthorized)
    }

    return nil
}

func (a *AllowedOriginFilter) getRulesForScope(ctx context.Context, app *db.App) []regexp.Regexp {
    origins := make([]regexp.Regexp, 0)
    rules, err := app.Rules(ctx)
    if err != nil {
        log.Println("couldn't get rules", err)
    } else {
        for _, rule := range rules {
            if rule.RuleType != ALLOWED_ORIGIN || !rule.Active {
                continue
            }
            matcher, err := regexp.Compile(rule.Value)
            if err != nil {
                log.Println("error compiling origin regex", err)
                continue
            }
            origins = append(origins, *matcher)
        }
    }
    return origins
}
