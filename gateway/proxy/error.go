package proxy

import (
    "net/http"
)

type FilterBlockError struct {}
func (fbe *FilterBlockError) Error() string {
    return "filter chain stopped"
}

type BalanceExceededError struct {
    error
}
func (bee *BalanceExceededError) Error() string {
    return "balance exceeded"
}
func NewBalanceExceededError() *BalanceExceededError {
    // TODO make sure this error code is fair
    return &BalanceExceededError{&HTTPError{http.StatusForbidden}}
}

type LifecycleIncompleteError struct {
    error
}
func (lie *LifecycleIncompleteError) Error() string {
    return "lifecycle incomplete"
}
func NewLifecycleIncompleteError() *LifecycleIncompleteError {
    return &LifecycleIncompleteError{&HTTPError{http.StatusBadGateway}}
}

type HTTPError struct {
    code int
}
func NewHTTPError(code int) *HTTPError {
    return &HTTPError{code}
}
func (httpe *HTTPError) Error() string {
    return http.StatusText(httpe.code)
}
