package common

import (

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

const (
    APP string = "appId"
    PRODUCT    = "product"
    STATUS     = "status"
    TENANT     = "tenant"
    QUEUE      = "queue"
)

var (
    EndpointUsage = promauto.NewCounterVec(prometheus.CounterOpts{
        Name: "gateway_relay_usage",
        Help: "Usage grouped by app and chain (product), also tracking failed relays",
    }, []string{APP, TENANT, PRODUCT, STATUS})
    JobGauge = promauto.NewGaugeVec(prometheus.GaugeOpts{
        Name: "gateway_job_queue",
        Help: "If this grows too big it may effect performance, should scale up",
    }, []string{QUEUE})
)
