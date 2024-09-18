FROM golang:1.21

WORKDIR /app

# Get imports less frequently
COPY go.mod go.sum /.
RUN go mod download

# Build just the local stuff every time
COPY . .
RUN go build -o /go/bin/porters

EXPOSE 9000

CMD ["sh", "-c", "ulimit -n 65536 && exec /go/bin/porters gateway"]
