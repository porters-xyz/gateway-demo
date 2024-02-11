package proxy

import (
)

type FilterBlockError struct{}
func (fbe FilterBlockError) Error() string {
    return "filter chain stopped"
}
