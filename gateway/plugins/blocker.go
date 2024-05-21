package plugins

import (
    "errors"
    "fmt"
    log "log/slog"
    "net/http"
)

type Blocker struct {}

func (b Blocker) Load() {
    log.Debug("loading plugin", "plugin", b.Name())
}

func (b Blocker) Name() string {
    return "blocker"
}

func (b Blocker) Key() string {
    return "BLOCKER"
}

func (b Blocker) HandleRequest(req *http.Request) error {
    log.Debug("logging block, used for testing")
    return errors.New(fmt.Sprint("blocked by prehandler", b.Name()))
}

func (b Blocker) HandleResponse(resp *http.Response) error {
    log.Debug("logging block after proxy, used for testing")
    return errors.New(fmt.Sprint("blocked by posthandler", b.Name()))
}
