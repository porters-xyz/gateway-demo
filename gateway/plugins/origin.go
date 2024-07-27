package plugins

import (
	"context"
	log "log/slog"
	"net/http"
	"strings"

	"porters/db"
	"porters/proxy"
)

const (
	ORIGIN_HEADER  string = "Origin"
	ALLOWED_ORIGIN        = "allowed-origins"
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
	log.Debug("loading plugin", "plugin", a.Name())
}

func (a *AllowedOriginFilter) HandleRequest(req *http.Request) error {
	ctx := req.Context()
	origin := req.Header.Get(ORIGIN_HEADER)
	app := &db.App{
		Id: proxy.PluckAppId(req),
	}
	ctx, err := app.Lookup(ctx)
	if err != nil {
		return proxy.NewHTTPError(http.StatusNotFound)
	}

	rules := a.getRulesForScope(ctx, app)
	allow := a.matchesRules(origin, rules)

	if !allow {
		return proxy.NewHTTPError(http.StatusUnauthorized)
	}

	*req = *req.WithContext(ctx)

	return nil
}

func (a *AllowedOriginFilter) HandleResponse(resp *http.Response) error {
	ctx := resp.Request.Context()
	app := &db.App{
		Id: proxy.PluckAppId(resp.Request),
	}
	ctx, err := app.Lookup(ctx)
	if err != nil {
		return nil // don't modify header
	}

	rules := a.getRulesForScope(ctx, app)
	resp.Header.Set("Access-Control-Allow-Headers", "authorization, content-type, server")
	resp.Header.Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")

	var allowedOrigins string
	if len(rules) > 0 {
		allowedOrigins = strings.Join(rules, ",")
	} else {
		allowedOrigins = "*" // default value if no rules are found
	}
	resp.Header.Set("Access-Control-Allow-Origin", allowedOrigins)

	return nil
}

func (a *AllowedOriginFilter) getRulesForScope(ctx context.Context, app *db.App) []string {
	origins := make([]string, 0)
	rules, err := app.Rules(ctx)
	if err != nil {
		log.Error("couldn't get rules", "app", app.HashId(), "err", err)
	} else {
		for _, rule := range rules {
			if rule.RuleType != ALLOWED_ORIGIN || !rule.Active {
				continue
			}
			origins = append(origins, rule.Value)
		}
	}
	return origins
}

func (a *AllowedOriginFilter) matchesRules(origin string, rules []string) bool {
	if len(rules) == 0 {
		return true
	}
	for _, rule := range rules {
		if strings.EqualFold(rule, origin) {
			return true
		}
	}
	return false
}
