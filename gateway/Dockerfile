FROM golang:1.21

WORKDIR /app

# Install Delve for debugging
RUN go install github.com/go-delve/delve/cmd/dlv@latest

# Get imports less frequently
COPY go.mod go.sum /.
RUN go mod download

# Build just the local stuff every time
COPY . .
RUN go build -o /go/bin/porters

# Expose the application port and the Delve debugging port
EXPOSE 9000 2345

# CMD ["porters", "gateway"]
# CMD to start Delve in headless mode and your application
CMD ["dlv", "exec", "/go/bin/porters", "--headless", "--listen=:2345", "--api-version=2", "--accept-multiclient", "--", "gateway", "--host=0.0.0.0", "--port=9000"]
