default:
    @just --list

clean:
    @just gateway/clean
    @just web-portal/clean
    @just docs/clean

test:
    @just gateway/test

generate:
    @just web-portal/backend/generate
migrate:
    @just web-portal/backend/migrate

dev:
    @just web-portal/dev
build:
    @just gateway/build
    @just web-portal/build
run:
    @just gateway/run
    @just web-portal/run

stage:
    @just gateway/stage
    @just web-portal/stage

prod:
    @just gateway/prod
    @just services/gatewaykit/prod
    @just services/redis/prod
