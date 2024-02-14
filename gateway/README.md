# PORTERS gateway

## To build
`just build`

or

`go install`

## To run

`just run`

or

`porters gateway`

## Dependencies

running postgres (see ../services)
running redis
.env
  - DATABASE_URL
  - POSTGRES_PASSWORD
  - REDIS_ADDR
  - REDIS_PASS
