package proxy

import (
    "fmt"
    "net/http"
)

var FilterBlockError error = fmt.Errorf("filter chain stopped")
var BalanceExceededError error = fmt.Errorf("balance exceeded: %w", NewHTTPError(http.StatusForbidden))
var LifecycleIncompleteError error = fmt.Errorf("lifecycle incomplete: %w", NewHTTPError(http.StatusBadGateway))

type HTTPError struct {
    code int
}
func NewHTTPError(code int) *HTTPError {
    return &HTTPError{code}
}
func (httpe *HTTPError) Error() string {
    return http.StatusText(httpe.code)
}
