package plugins

import (
    "context"
    "log"
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
    log.Println("loading", p.Name())
}

func (p *ProductFilter) HandleRequest(req *http.Request) error {
    ctx := req.Context()
    product := proxy.PluckProductName(req)
    app := &db.App{
        Id: proxy.PluckAppId(req),
    }
    err := app.Lookup(ctx)
    if err != nil {
        return proxy.NewHTTPError(http.StatusNotFound)
    }

    rules := p.getRulesForScope(ctx, app)
    allow := (len(rules) == 0)

    for _, rule := range rules {
        if rule == product {
            allow = true
            break
        }
    }

    if !allow {
        return proxy.NewHTTPError(http.StatusUnauthorized)
    }
    return nil
}

func (p *ProductFilter) getRulesForScope(ctx context.Context, app *db.App) []string {
    products := make([]string, 0)
    rules, err := app.Rules(ctx)
    if err != nil {
        log.Println("couldn't read rules", err)
    } else {
        for _, rule := range rules {
            if rule.RuleType != ALLOWED_PRODUCTS || !rule.Active {
                continue
            }
            log.Println("allowing", rule.Value)
            products = append(products, rule.Value)
        }
    }
    return products
}
