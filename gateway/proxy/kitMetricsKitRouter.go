package proxy

import (
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	log "log/slog"
	"net/http"
	"strings"

	"porters/common"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Machine struct {
	ID         string `json:"id"`
	InstanceID string `json:"instance_id"`
	Region     string `json:"region"`
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	// Commenting due to issue with metrics capturing

	// // Retrieve the expected API key from environment variables
	// expectedApiKey := os.Getenv("GATEWAY_API_KEY")

	// // Get the API key from the request headers
	// apiKey := r.Header.Get("api-key")

	// // Validate the API key
	// if apiKey == "" || apiKey != expectedApiKey {
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }

	// Delegate the request to the Prometheus handler
	promhttp.Handler().ServeHTTP(w, r)
}

func qosNodesHandler(w http.ResponseWriter, r *http.Request, proxyToUrl, region string) {
	// in order to call this endpoint, the user must pass the `GATEWAY_REQUEST_API_KEY` in the header
	expectedApiKey := common.GetConfig(common.GATEWAY_REQUEST_API_KEY)
	apiKey := r.Header.Get("api-key")

	if apiKey == "" || apiKey != expectedApiKey {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	flyApiKey := common.GetConfig(common.FLY_API_KEY)
	// Fetch the machines from Fly.io
	machines, err := fetchMachines(flyApiKey)
	if err != nil {
		http.Error(w, "Unable to retrieve machines from Fly.io", http.StatusInternalServerError)
		return
	}

	// Find the machine for the given region
	machineID := ""
	for _, machine := range machines {
		if strings.EqualFold(machine.Region, region) {
			machineID = machine.ID
			break
		}
	}

	if machineID == "" {
		http.Error(w, "Machine not found for the given region", http.StatusNotFound)
		return
	}

	log.Info("Retrieved Machine ID for gatewaykit", "Machine ID", machineID)

	// Construct the metrics URL
	kitMetricsUrl := fmt.Sprintf("%s/qosnodes", proxyToUrl)

	log.Info("Calling metrics endpoint", "kitMetricsUrl", kitMetricsUrl)

	// Create a new HTTP request
	req, err := http.NewRequest("GET", kitMetricsUrl, nil)
	if err != nil {
		http.Error(w, "Unable to create request", http.StatusInternalServerError)
		return
	}

	gatewayApiKey := common.GetConfig(common.GATEWAY_API_KEY)

	//add the headers
	req.Header.Set("fly-force-instance-id", machineID)
	req.Header.Set("x-api-key", gatewayApiKey)

	// Forward the request to the kit's /metrics endpoint
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Unable to retrieve kit metrics", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response body to the proxy response
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func fetchMachines(authToken string) ([]Machine, error) {
	flyGatewayMachines := common.GetConfig(common.FLY_GATEWAY_URI)
	// Create a new request to fetch the machines
	req, err := http.NewRequest("GET", flyGatewayMachines, nil)
	if err != nil {
		return nil, err
	}

	// Set the Authorization header with the Bearer token
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authToken))

	// Perform the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the response is gzipped and handle accordingly
	var reader io.ReadCloser
	if resp.Header.Get("Content-Encoding") == "gzip" {
		reader, err = gzip.NewReader(resp.Body)
		if err != nil {
			return nil, err
		}
		defer reader.Close()
	} else {
		reader = resp.Body
	}

	// Decode the JSON response into the machines slice
	var machines []Machine
	err = json.NewDecoder(reader).Decode(&machines)
	if err != nil {
		return nil, err
	}

	return machines, nil
}
