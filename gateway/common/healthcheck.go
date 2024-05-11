package common

import (
    "encoding/json"
)

type HealthCheck interface {
    Healthcheck() HealthCheckStatus
}

// state 0 for unknown/caution, <0 for error, >0 for healthy
type SingleStatus struct {
    State int `json:"state"`
    Msg string `json:"message"`
    Err error `json:"error,omitempty"`
}

type HealthCheckStatus struct {
    status map[string]SingleStatus 
}

func NewHealthCheckStatus() *HealthCheckStatus {
    return &HealthCheckStatus{
        status: make(map[string]SingleStatus, 0),
    }
}

// Latest message for key overwrites others (retains non-healthy states)
func (h *HealthCheckStatus) AddHealthy(key string, value string) {
    s, ok := h.status[key]
    if s.State > 0 || !ok {
        s.State += 1
        s.Msg = value
    }
    h.status[key] = s
}

// err optional, state stays 0, latest message reported
func (h *HealthCheckStatus) AddCaution(key string, value string, err error) {
    s := h.status[key]
    if s.State >= 0  {
        s.State = 0
        s.Msg = value
        s.Err = err
    }
    h.status[key] = s
}

func (h *HealthCheckStatus) AddError(key string, err error) {
    s := h.status[key]
    s.State -= 1
    s.Msg = err.Error()
    s.Err = err
    h.status[key] = s
}

// modifies parent to include child health checks
func (h *HealthCheckStatus) Aggregate(child *HealthCheckStatus) {
    for k, v := range child.status {
        parval, ok := h.status[k]
        if !ok || (parval.State > v.State){
            parval = v
        }
        h.status[k] = parval
    }
}

func (h *HealthCheckStatus) ToJson() string {
    j, err := json.Marshal(h.status)
    if err != nil {
        return ""
    }
    return string(j)
}
