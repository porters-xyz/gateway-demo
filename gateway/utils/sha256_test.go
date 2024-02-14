package utils

import (
    "testing"

)

func TestHash(t *testing.T) {
    want := "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    have := Hash("test")
    if want != have {
        t.Fatalf(`want %x got %x`, want, have)
    }
}
