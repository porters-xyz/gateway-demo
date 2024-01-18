package demo

import(
    "io"
    "net/http"
)

func Serve() {

    handler := func() func(http.ResponseWriter, *http.Request) {
        return func(writer http.ResponseWriter, req *http.Request) {
            if (req.Header.Get("X-Foo") != "") {
                io.WriteString(writer, "Proxied!")
            } else {
                io.WriteString(writer, "Not Proxied.")
            }
        }
    }

    http.HandleFunc("/", handler())
    http.ListenAndServe(":9999", nil)
}
