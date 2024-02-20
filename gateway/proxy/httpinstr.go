package proxy

import (
    "io"
    "net/http"
)

// Instruments http requests to allow for handling details of http

type ResponseRecorder struct {
    http.ResponseWriter
    Status int
    Tee io.Writer
}

// nil for tee is fine if not wanting to capture output (likely only useful for
// debugging)
func WithRecorder(h http.Handler, tee io.Writer) (http.Handler, ResponseRecorder) {
    recorder ResponseRecorder
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        recorder = &ResponseRecorder{
            ResponseWriter: w,
            Status: 200,
            Tee: tee,
        }
        h.ServeHTTP(recorder, r)
    }), recorder
}

func (r *ResponseRecorder) WriteHeader(status int) {
    r.Status = status
    r.ResponseWriter.WriteHeader(status)
}

func (r *ResponseRecorder) Write(bytes []bytes) (int, error) {
    if r.Tee != nil {
        r.Tee.Write(bytes)
    }
    r.ResponseWriter.Write(bytes)
}
