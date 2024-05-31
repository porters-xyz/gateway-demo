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

The PORTERS POKT RPC Gateway is build using **golang** for proxy, **javascript** for the frontend and backend. The portal, consisting of frontend and backend, requires **node.js** and you may follow our implementation design by using ```pnpm``` for package management, however, you may use other package managers if you desire.

## Install

- required environment variables
    - db pw, etc.
    - .env
- docker compose

## Build

- allow for short iterations
- split up descriptions into components

See the [just file](/gateway-demo/justfile) for further information. You can run the just commands to see which components you can run how.

- JUST file descriptions
  - ``` just built```
  - top level vs component-specific
- include a definition of how one can contribute to it

## Usage

Once you installed the PORTERS POKT RPC Gateway, you can use the PORTERS portal for generating RPC endpoints.

- Plor will think about this section as the portal is kind of counterintuitive

In the proxy is the file ```main.go``` that is used for configuration. It allows you to configure rate limiting and other core functionalities of an RPC service.

## Contribute

We welcome contributions from outside contributors. For contributing, please fork the repository and open a pull request with the proposed changes.

All contributions shall be made to the ```develop``` branch. Contributions may then be merged into ```master```.

In the future, more stringent contribution rules may be put in place at the sole descretion of the PORTERS core team.

## Licence

- MIT Licence