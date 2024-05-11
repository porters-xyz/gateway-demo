package proxy

import (
    "io"
    "net/http"
)

// Instruments http requests to allow for handling details of http
// Might not be needed, but useful if middleware is still required somewhere
type ResponseRecorder struct {
    http.ResponseWriter
    Status int
    Tee io.Writer
}

// nil for tee is fine if not wanting to capture output (likely only useful for
// debugging)
func WithRecorder(h http.Handler, tee io.Writer) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        recorder := &ResponseRecorder{
            ResponseWriter: w,
            Status: 200,
            Tee: tee,
        }
        h.ServeHTTP(recorder, r)
        
    })
}

func (r *ResponseRecorder) WriteHeader(status int) {
    r.Status = status
    r.ResponseWriter.WriteHeader(status)
}

func (r *ResponseRecorder) Write(bytes []byte) (int, error) {
    if r.Tee != nil {
        r.Tee.Write(bytes)
    }
    return r.ResponseWriter.Write(bytes)
}
