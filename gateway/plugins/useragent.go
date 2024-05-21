package plugins

import (
    "context"
    log "log/slog"
    "net/http"
    "regexp"

    "porters/db"
    "porters/proxy"
)

const (
    UA_TYPE_ID string = "allowed-user-agents"
)

type UserAgentFilter struct {

}

func (u *UserAgentFilter) Name() string {
    return "User Agent Filter"
}

func (u *UserAgentFilter) Key() string {
    return "USERAGENT"
}

func (u *UserAgentFilter) Load() {
    log.Debug("Loading plugin", "plugin", u.Name())
}

func (u *UserAgentFilter) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    ua := req.UserAgent()
    appId := proxy.PluckAppId(req)
    app := &db.App{Id: appId}
    err := app.Lookup(ctx)
    if err != nil {
        return proxy.NewHTTPError(http.StatusNotFound)
    }

    rules := u.getRulesForScope(ctx, app)
    success := (len(rules) == 0)

    for _, rule := range rules {
        if (rule.MatchString(ua)) {
            success = true
            break
        }
    }

    if !success {
        return proxy.NewHTTPError(http.StatusUnauthorized)
    }
    return nil
}

func (u *UserAgentFilter) getRulesForScope(ctx context.Context, app *db.App) []regexp.Regexp {
    useragents := make([]regexp.Regexp, 0)
    rules, err := app.Rules(ctx)
    if err != nil {
        log.Error("couldn't get rules", "err", err)
    } else {
        for _, rule := range rules {
            if rule.RuleType != UA_TYPE_ID || !rule.Active {
                continue
            }
            matcher, err := regexp.Compile(rule.Value)
            if err != nil {
                log.Error("unable to compile regexp", "regex", rule.Value, "err", err)
            } else {
                useragents = append(useragents, *matcher)
            }
        }
    }
    return useragents
}
