package proxy

import (
	"fmt"
	"io"
	"net/http"
)

func kitMetricsHandler(w http.ResponseWriter, r *http.Request, proxyToUrl string) {
	kitMetricsUrl := fmt.Sprintf("%s/metrics", proxyToUrl)

	// Forward the request to the kit's /metrics endpoint
	resp, err := http.Get(kitMetricsUrl)
	if err != nil {
		http.Error(w, "Unable to retrieve kit metrics", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response body to the proxy response
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
