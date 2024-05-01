package common

import (

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    EndpointUsage = promauto.NewCounterVec(prometheus.CounterOpts{
        Name: "Relay usage",
        Help: "Usage grouped by app and chain (product), also tracking failed relays",
    }, []string{"app", "product", "status"})

    JobGauge = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "Job queue and worker threads",
        Help: "If this grows too big it may effect performance, should scale up",
    })
)
