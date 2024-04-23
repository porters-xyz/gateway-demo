package utils

import (
    "testing"
    "time"
)

func TestParse(t *testing.T) {
    type wants struct {
        amount int
        period time.Duration
    }

    type testCase struct {
        name string
        arg string
        want wants
    }

    tests := []testCase{
        {
            name: "test simple",
            arg: "1000/P1D",
            want: wants{amount: 1000, period: 24 * time.Hour},
        },
        {
            name: "test complex",
            arg: "10000/P3Y2M11DT7H8M10.555S",
            want: wants{amount: 10000, period: 100768090555 * time.Millisecond},
        },
        {
            name: "test milliseconds",
            arg: "1/PT0.001S",
            want: wants{amount: 1, period: 1 * time.Millisecond},
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, _ := ParseRate(tt.arg)
            if got.Amount != tt.want.amount || got.Period != tt.want.period {
                t.Fatalf(`want %d, %d got %d`, tt.want.amount, tt.want.period, got)
            }
        })
    }
}
