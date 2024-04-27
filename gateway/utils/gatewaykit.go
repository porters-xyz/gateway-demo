package utils

//// GATEWAYKIT UTILS ////
// Used for interacting with gatewaykit and pokt

import (
    "fmt"
    "net/url"
    "strings"
)

type Target struct {
    server *url.URL
    poktId string
}

func NewTarget(remote *url.URL, id string) *Target {
    // 4 digit id is required
    fixedId := fmt.Sprintf("%04s", id)
    return &Target{
        server: remote,
        poktId: fixedId,
    }
}

func (t *Target) URL() *url.URL {
    fullurl := t.withRelayPath()
    fullurl = fullurl.JoinPath(t.poktId)
    return fullurl
}

// We want to make sure we direct traffic to relay path
func (t *Target) withRelayPath() *url.URL {
    retval := t.server
    if !strings.HasSuffix(retval.Path, "relay") && !strings.HasSuffix(retval.Path, "relay/") {
        retval = retval.JoinPath("relay") 
    }
    return retval
}
