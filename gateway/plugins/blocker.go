package plugins

import (
    "errors"
    "fmt"
    "log"
    "net/http"
    "porters/proxy"
)

type Blocker struct {}

func (b Blocker) Load() {
    log.Println("loading " + b.Name())
}

func (b Blocker) Name() string {
    return "blocker"
}

func (b Blocker) Key() string {
    return "BLOCKER"
}

func (b Blocker) PreHandler(req *http.Request) {
    cancel := proxy.RequestCanceler(req)
    cancel(errors.New(fmt.Sprint("blocked by prehandler", b.Name())))
    log.Println("logging block")
}

func (b Blocker) PostHandler(resp *http.Response) error {
    log.Println("logging block (post)")
    return errors.New(fmt.Sprint("blocked by posthandler", b.Name()))
}
