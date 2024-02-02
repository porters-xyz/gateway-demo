default:
    @just --list

build:
    @just gateway/build
    yarn build
dev:
    yarn dev
test:
    @just gateway/test

migrate:
    yarn migrate
