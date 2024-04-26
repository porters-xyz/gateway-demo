package common

import (
    "fmt"
    "log"
    "os"
    "strconv"
    "sync"
)

// store config as constants for now
const (
    SHUTDOWN_DELAY string = "SHUTDOWN_DELAY"
    JOB_BUFFER_SIZE       = "JOB_BUFFER_SIZE"
    NUM_WORKERS           = "NUM_WORKERS"
    PROXY_TO              = "PROXY_TO"
    HOST                  = "HOST" // host to add subdomains to
    DATABASE_URL          = "DATABASE_URL"
    REDIS_URL             = "REDIS_URL"
    REDIS_ADDR            = "REDIS_ADDR"
    REDIS_USER            = "REDIS_USER"
    REDIS_PASSWORD        = "REDIS_PASSWORD"
    
)

// This may evolve to include config outside env, or use .env file for
// convenience
type Config struct {
    defaults map[string]string
}

var config *Config
var configMutex sync.Once

func setupConfig() *Config {
    configMutex.Do(func() {
        config = &Config{
            defaults: make(map[string]string),
        }
        config.defaults[SHUTDOWN_DELAY] = "5"
        config.defaults[JOB_BUFFER_SIZE] = "50"
        config.defaults[NUM_WORKERS] = "10"
        config.defaults[HOST] = "localhost"
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
            log.Println(fmt.Sprintf("config not set for %s, no default", key))
            return ""
        }
    }
}

func GetConfigInt(key string) int {
    configval := GetConfig(key)
    intval, err := strconv.Atoi(configval)
    if err != nil {
        log.Println("Error parsing config", err)
        intval = -1
    }
    return intval
}
