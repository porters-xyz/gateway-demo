package plugins

import (
	"context"
	log "log/slog"
	"net/http"

	"porters/db"
	"porters/proxy"
)

const (
	ALLOWED_PRODUCTS string = "approved-chains"
)

type ProductFilter struct {
}

func (p *ProductFilter) Name() string {
	return "Approved Chains"
}

func (p *ProductFilter) Key() string {
	return "ALLOWEDPRODUCT"
}

func (p *ProductFilter) Load() {
	log.Debug("loading plugin", "plugin", p.Name())
}

func (p *ProductFilter) HandleRequest(req *http.Request) error {
	ctx := req.Context()
	product := proxy.PluckProductName(req)
	log.Info("Plucked product name", "product", product)
	app := &db.App{
		Id: proxy.PluckAppId(req),
	}
	log.Info("Plucked app ID", "appID", app.Id)
	err := app.Lookup(ctx)
	if err != nil {
		return proxy.NewHTTPError(http.StatusNotFound)
	}

	rules := p.getRulesForScope(ctx, app)
	log.Info("Retrieved rules for scope", "rules", rules)

	allow := (len(rules) == 0)
	log.Info("Initial allow value", "allow", allow)

	for _, rule := range rules {
		log.Info("Checking rule against product", "rule", rule, "product", product)
		if rule == product {
			allow = true
			break
		}
	}

	if !allow {
		log.Error("Unauthorized access attempt", "product", product)
		return proxy.NewHTTPError(http.StatusUnauthorized)
	}

	log.Info("Request allowed", "product", product)
	return nil
}

func (p *ProductFilter) getRulesForScope(ctx context.Context, app *db.App) []string {
	products := make([]string, 0)
	rules, err := app.Rules(ctx)
	if err != nil {
		log.Error("couldn't read rules", "app", app.HashId(), "err", err)
	} else {
		for _, rule := range rules {
			if rule.RuleType != ALLOWED_PRODUCTS || !rule.Active {
				log.Info("blocking product", "product", rule.Value)
				continue
			}
			log.Info("allowing product", "product", rule.Value)
			products = append(products, rule.Value)
		}
	}
	return products
}
