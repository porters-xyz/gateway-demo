package common

import (
	log "log/slog"
	"os"
	"strconv"
	"strings"
	"sync"
)

// store config as constants for now
const (
	SHUTDOWN_DELAY          string = "SHUTDOWN_DELAY"
	JOB_BUFFER_SIZE                = "JOB_BUFFER_SIZE"
	NUM_WORKERS                    = "NUM_WORKERS"
	PROXY_TO                       = "PROXY_TO"
	HOST                           = "HOST" // host to add subdomains to
	PORT                           = "PORT"
	DATABASE_URL                   = "DATABASE_URL"
	REDIS_URL                      = "REDIS_URL"
	REDIS_ADDR                     = "REDIS_ADDR"
	REDIS_USER                     = "REDIS_USER"
	REDIS_PASSWORD                 = "REDIS_PASSWORD"
	INSTRUMENT_ENABLED             = "ENABLE_INSTRUMENT"
	LOG_LEVEL                      = "LOG_LEVEL"               //Used for debugging purposes
	LOG_HTTP_REQUEST               = "LOG_HTTP_REQUEST"        //Used for debugging purposes
	LOG_HTTP_REQUEST_FILTER        = "LOG_HTTP_REQUEST_FILTER" //Used for debugging purposes
	LOG_HTTP_RESPONSE              = "LOG_HTTP_RESPONSE"       //Used for debugging purposes
	LOG_BALANCE_UPDATE             = "LOG_BALANCE_UPDATE"      //Used for debugging purposes
	FLY_API_KEY                    = "FLY_API_KEY"
	FLY_GATEWAY_URI                = "FLY_GATEWAY_URI"
	GATEWAY_API_KEY                = "GATEWAY_API_KEY"
	GATEWAY_REQUEST_API_KEY        = "GATEWAY_REQUEST_API_KEY"
	FILE_DESCRIPTOR_LIMIT          = "FILE_DESCRIPTOR_LIMIT"
)

// This may evolve to include config outside env, or use .env file for
// convenience
type Config struct {
	defaults map[string]string
	loglevel *log.LevelVar
}

var config *Config
var configMutex sync.Once

func setupConfig() *Config {
	configMutex.Do(func() {
		config = &Config{
			defaults: make(map[string]string),
			loglevel: &log.LevelVar{},
		}
		config.defaults[SHUTDOWN_DELAY] = "5"
		config.defaults[JOB_BUFFER_SIZE] = "50"
		config.defaults[NUM_WORKERS] = "10"
		config.defaults[HOST] = "localhost"
		config.defaults[PORT] = "9000"
		config.defaults[INSTRUMENT_ENABLED] = "false"
		config.defaults[LOG_HTTP_REQUEST] = "false"
		config.defaults[LOG_HTTP_RESPONSE] = "false"
		config.defaults[LOG_BALANCE_UPDATE] = "false"
		config.defaults[LOG_HTTP_REQUEST_FILTER] = ""
		config.defaults[FILE_DESCRIPTOR_LIMIT] = "5000"

		level := parseLogLevel(os.Getenv(LOG_LEVEL))
		config.SetLogLevel(level)
	})
	return config
}

func GetConfig(key string) string {
	config := setupConfig()
	value, ok := os.LookupEnv(key)
	if ok {
		return value
	} else {
		defaultval, ok := config.defaults[key]
		if ok {
			return defaultval
		} else {
			log.Warn("config not set, no default", "key", key)
			return ""
		}
	}
}

func GetConfigInt(key string) int {
	configval := GetConfig(key)
	intval, err := strconv.Atoi(configval)
	if err != nil {
		log.Error("Error parsing config", "err", err)
		intval = -1
	}
	return intval
}

func Enabled(key string) bool {
	configval := GetConfig(key)
	boolval, err := strconv.ParseBool(configval)
	if err != nil {
		boolval = false
	}
	return boolval
}

func GetLogLevel() log.Level {
	configval := GetConfig(LOG_LEVEL)
	return parseLogLevel(configval)
}

func parseLogLevel(level string) log.Level {
	if strings.EqualFold(level, "ERROR") {
		return log.LevelError
	} else if strings.EqualFold(level, "WARN") {
		return log.LevelWarn
	} else if strings.EqualFold(level, "DEBUG") {
		return log.LevelDebug
	} else {
		return log.LevelInfo
	}
}

func (c *Config) SetLogLevel(level log.Level) {
	c.loglevel.Set(level)
	logger := log.New(log.NewTextHandler(os.Stdout, &log.HandlerOptions{Level: c.loglevel}))
	log.SetDefault(logger)
}

// shouldLogRequest checks if the request URL path matches any of the specified filters in common.LOG_HTTP_FILTER_APP.
// If the filter list is empty, it logs all requests.
func ShouldLogRequest(urlPath string) bool {
	filters := GetConfig(LOG_HTTP_REQUEST_FILTER)
	if filters == "" {
		// If no filters are specified, log everything
		return true
	}

	filterList := strings.Split(filters, ",")
	for _, filter := range filterList {
		if strings.Contains(urlPath, filter) {
			return true
		}
	}
	return false
}
