package proxy

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"porters/common"
	"porters/db"

	"golang.org/x/sys/unix"
)

type HealthStatus struct {
	CacheHealth *common.HealthCheckStatus `json:"cache_health"` // Use the correct type here
}

// New function to check file descriptor health and log the results using slog
func checkFileDescriptorHealth() bool {
	var rLimit unix.Rlimit
	fdLimit := common.GetConfigInt("FILE_DESCRIPTOR_LIMIT")

	// Get the max number of allowed file descriptors
	err := unix.Getrlimit(unix.RLIMIT_NOFILE, &rLimit)
	if err != nil {
		slog.Error("Error retrieving file descriptor limit", "error", err)
		return false
	}

	// Get the actual number of file descriptors in use
	files, err := os.ReadDir("/proc/self/fd")
	if err != nil {
		slog.Error("Error reading /proc/self/fd", "error", err)
		return false
	}
	fdUsage := uint64(len(files))

	healthy := fdUsage < uint64(fdLimit)

	// Log the file descriptor information using slog
	slog.Info("File Descriptor Usage",
		"max", rLimit.Cur,
		"used", fdUsage,
		"healthy", healthy)

	return healthy
}

// Update your healthHandler to log file descriptor health but not expose it
func healthHandler(resp http.ResponseWriter, req *http.Request) {
	// Existing cache health check
	cacheHealth := (&db.Cache{}).Healthcheck()

	// Log file descriptor health and determine if the server is healthy
	fdHealthy := checkFileDescriptorHealth()

	// Only return the non-sensitive health information (cache health)
	healthStatus := HealthStatus{
		CacheHealth: cacheHealth,
	}

	// Marshal the health status into JSON
	resp.Header().Set("Content-Type", "application/json")

	if fdHealthy {
		io.WriteString(resp, healthStatus.CacheHealth.ToJson())
	} else {
		resp.WriteHeader(http.StatusInternalServerError)
		io.WriteString(resp, fmt.Sprintf(`{"error": "file descriptor limit exceeded"}`))
	}
}
