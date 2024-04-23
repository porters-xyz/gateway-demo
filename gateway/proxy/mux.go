package proxy

import (
    "net/http"

    "github.com/gorilla/mux"
)

const (
    APP_PATH string = "appId"
)

func PluckAppId(req *http.Request) string {
    appId := mux.Vars(req)[APP_PATH]
    return appId
}
