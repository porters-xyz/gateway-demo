package proxy

import (
    "fmt"
    "net/http"

    "github.com/gorilla/mux"

    "porters/common"
)

const (
    APP_PATH string = "appId"
    PRODUCT_NAME    = "product"
    HEALTH          = "health"
)

func PluckAppId(req *http.Request) string {
    appId := mux.Vars(req)[APP_PATH]
    return appId
}

func PluckProductName(req *http.Request) string {
    productName := mux.Vars(req)[PRODUCT_NAME]
    return productName
}

func addProxyRoutes(r *mux.Router) *mux.Router {
    proxyHost := common.GetConfig(common.HOST)
    host := fmt.Sprintf(`{%s}.%s`, PRODUCT_NAME, proxyHost)
    subrouter := r.Host(host).Subrouter()
    return subrouter
}

func addHealthcheckRoute(r *mux.Router) *mux.Router {
    subrouter := r.PathPrefix("/health").Subrouter()
    subrouter.HandleFunc("", healthHandler)
    return subrouter
}
