# Gateway-server

The gateway-server provided is used to manage connections to the RPC nodes. The
reverse proxy routes to this endpoint for users who pass the authentication and
authorization checks. This depends on postgres to manage app stakes and reports
to prometheus.

Find source code [here](https://github.com/pokt-network/gateway-server).

Run `fly postgres attach` to get environment variable to set as
`DB_CONNECTION_URL`
