package proxy

import (
	"io"
	"log/slog"
	"net/http"
	"porters/common"
	"porters/db"

	"golang.org/x/sys/unix"
)

type HealthStatus struct {
	CacheHealth *common.HealthCheckStatus `json:"cache_health"` // Use the correct type here
}

// New function to check file descriptor health and log the results using slog
func checkFileDescriptorHealth() {
	var rLimit unix.rLimit

	// Get the max number of allowed file descriptors
	//err := unix.Getrlimit(unix.RLIMIT_NOFILE, &rLimit) // Corrected package usage
	err := unix.Getrlimit(unix.RLIMIT_NOFILE, &rLimit)
	if err != nil {
		slog.Error("Error retrieving file descriptor limit", "error", err)
		return
	}

	// Log the file descriptor information using slog (mocking file descriptor usage for now)
	fdUsage := uint64(0) // Placeholder, replace with actual logic if available
	slog.Info("File Descriptor Usage",
		"max", rLimit.Cur,
		"used", fdUsage,
		"healthy", fdUsage < rLimit.Cur*80/100)
}

// Update your healthHandler to log file descriptor health but not expose it
func healthHandler(resp http.ResponseWriter, req *http.Request) {
	// Existing cache health check
	cacheHealth := (&db.Cache{}).Healthcheck()

	// Log file descriptor health (do not expose it in the response)
	checkFileDescriptorHealth()

	// Only return the non-sensitive health information (cache health)
	healthStatus := HealthStatus{
		CacheHealth: cacheHealth,
	}

	// Marshal the health status into JSON
	resp.Header().Set("Content-Type", "application/json")
	io.WriteString(resp, healthStatus.CacheHealth.ToJson())
}
