default:
    @just --list

build:
    go install .

test:
    go test

alias b := build
