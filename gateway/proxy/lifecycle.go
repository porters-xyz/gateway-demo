package proxy


// Used for tracking in context for completion of lifecycle
type Lifecycle struct {
    Authentication bool
    Authorization bool
    RateLimit bool
}

// TODO add additional required fields
func (l Lifecycle) checkComplete() bool {
    complete := l.Authentication && l.Authorization && l.RateLimit
    return complete
}
