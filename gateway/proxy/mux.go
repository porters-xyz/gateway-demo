package proxy

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	"porters/common"
)

const (
	APP_PATH     string = "appId"
	PRODUCT_NAME        = "product"
	HEALTH              = "health"
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

func addMetricsRoute(r *mux.Router) *mux.Router {
	subrouter := r.PathPrefix("/metrics").Subrouter()
	subrouter.HandleFunc("", metricsHandler)
	return subrouter
}

// Since the Gateway Kit is on an internal private network, with only the Gateway having access to it, we proxy a gateway-kit/metrics endpoint to expose the data to POKTScan
func addMetricsKitRoute(r *mux.Router, proxyToUrl string) *mux.Router {
	subrouter := r.PathPrefix("/gateway-kit/qosnodes").Subrouter()
	subrouter.HandleFunc("/{region}", func(w http.ResponseWriter, r *http.Request) {
		region := mux.Vars(r)["region"]
		qosNodesHandler(w, r, proxyToUrl, region)
	})
	return subrouter
}
