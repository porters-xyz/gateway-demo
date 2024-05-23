package proxy

import (
    "fmt"
    "net/http"
)

var FilterBlockError error = fmt.Errorf("filter chain stopped")
var BalanceExceededError error = fmt.Errorf("balance exceeded: %w", NewHTTPError(http.StatusForbidden))
var LifecycleIncompleteError error = fmt.Errorf("lifecycle incomplete: %w", NewHTTPError(http.StatusBadGateway))
var APIKeyInvalidError error = fmt.Errorf("incorrect api key: %w", NewHTTPError(http.StatusUnauthorized))
var ChainNotSupportedError error = fmt.Errorf("chain not supported: %w", NewHTTPError(http.StatusNotFound))

type HTTPError struct {
    code int
}
func NewHTTPError(code int) *HTTPError {
    return &HTTPError{code}
}
func NewRateLimitError(limit string) error {
    return fmt.Errorf("rate limit of %s exceeded: %w",
        limit, NewHTTPError(http.StatusTooManyRequests))
}
func (httpe *HTTPError) Error() string {
    return http.StatusText(httpe.code)
}
