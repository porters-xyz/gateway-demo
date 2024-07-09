# PORTERS POKT RPC Gateway

## Table of Contents

## Background

- Gateway Kit
- POKT
- Sign-in-with-Ethereum

### Dependencies

- Postgres
- Prisma
- Prometheus

## Requirements

The PORTERS POKT RPC Gateway is build using **golang** for proxy, **javascript** for the frontend and backend. The portal, consisting of frontend and backend, requires **node.js** and you may follow our implementation design by using `pnpm` for package management, however, you may use other package managers if you desire.

## Install

- required environment variables (can set in .env for `docker compose`)
    - `API_ENDPOINT`: build arg for frontend to backend API
    - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: walletconnect project ID
    - `PROM_URL`: URL to Prometheus metrics api (scraped from instances)
    - `PROM_TOKEN`: Auth token for accessing Prometheus metrics
    - `DATABASE_URL`: connection string for postgres database (portal schema)
    - `ONEINCH_API_KEY`: key for price data from 1inch
    - `OX_API_KEY`: key for 0x protocol for swaps
    - `RPC_KEY`: RPC key for event listener
    - `SESSION_SECRET`: Encryption secret for SIWE sessions
    - `HOST`: RPC proxy host that wildcard subdomain is attached to
    - `JOB_BUFFER_SIZE`: size of worker pool
    - `NUM_WORKERS`: count of workers for pool
    - `REDIS_URL`: connection string to Redis instance
    - `PROXY_TO`: base URL of Gateway Server
    - `ALTRUIST_REQUEST_TIMEOUT`: see Gateway Server docs
    - `CHAIN_NETWORK`: see Gateway Server docs
    - `EMIT_SERVICE_URL_FROM_METRICS`: see Gateway Server docs
    - `ENVIRONMENT_STAGE`: see Gateway Server docs
    - `HTTP_SERVER_PORT`: see Gateway Server docs
    - `POKT_RPC_TIMEOUT`: see Gateway Server docs
    - `SESSION_CACHE_TTL`: see Gateway Server docs
    - `API_KEY`: see Gateway Server docs
    - `DB_CONNECTION_URL`: postgres connection string (gateway server schema)
    - `POKT_APPLICATIONS_ENCRYPTION_KEY`: see Gateway Server docs
    - `POKT_RPC_FULL_HOST`: see Gateway Server docs
- docker compose

## Build

- allows for shorter dev iteration (over docker)

See the [justfile](/gateway-demo/justfile) for further information. You can run the just commands to see which components you can run how.

- justfile
  - `just build` to build `just` to list other available commands
  - run from root directory or navigate into specific components

## Usage

Once you installed the PORTERS POKT RPC Gateway, you can use the PORTERS portal for generating RPC endpoints.

In the proxy is the file `main.go` that is used for configuration. It allows you to configure rate limiting and other core functionalities of an RPC service.

## Contribute

We welcome contributions from outside contributors. For contributing, please fork the repository and open a pull request with the proposed changes.

All contributions shall be made to the `develop` branch. Contributions may then be merged into `master`.

In the future, more stringent contribution rules may be put in place at the sole descretion of the PORTERS core team.

## Licence

- MIT Licence
