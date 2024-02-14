package utils

import (
    "crypto/sha256"
    "fmt"
)

func Hash(key string) string {
    h := sha256.New()
    h.Write([]byte(key))
    return fmt.Sprintf("%x", h.Sum(nil))
}
