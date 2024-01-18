default:
    @just --list

build:
    cd gateway; go install

test:
    cd gateway; go test

alias b := build
