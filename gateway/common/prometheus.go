package common

import (

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    EndpointUsage = promauto.NewCounterVec(prometheus.CounterOpts{
        Name: "gateway_relay_usage",
        Help: "Usage grouped by app and chain (product), also tracking failed relays",
    }, []string{"app", "product", "status"})

    JobGauge = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "gateway_job_queue",
        Help: "If this grows too big it may effect performance, should scale up",
    })

    ErrGauge = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "gateway_err_queue",
        Help: "Errors are centrally handled, high volumes of errors should be addressed",
    })
)
