package utils

import (
    "errors"
    "regexp"
    "strconv"
    "time"
)

// Using 30 day months, not for precise math
const (
    DAY time.Duration = 24 * time.Hour
    MONTH             = 30 * DAY
    YEAR              = 365 * DAY
)
var rateRegex = regexp.MustCompile(`(\d+)\/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)\.?(\d+)?S)?`)

type Rate struct {
    Amount int
    Period time.Duration
}

func ParseRate(rateString string) (Rate, error) {
    matches := rateRegex.FindStringSubmatch(rateString)
    if len(matches) == 0 {
        return Rate{}, errors.New("Invalid rate string")
    }

    amount := parseInt(matches[1])
    years := parseInt(matches[2])
    months := parseInt(matches[3])
    days := parseInt(matches[4])
    hours := parseInt(matches[5])
    minutes := parseInt(matches[6])
    seconds := parseInt(matches[7])
    decimals := parseInt(matches[8])

    // months set to 30 days, not to be added to real time
    period := time.Duration(years) * YEAR +
        time.Duration(months) * MONTH +
        time.Duration(days) * DAY +
        time.Duration(hours) * time.Hour +
        time.Duration(minutes) * time.Minute +
        time.Duration(seconds) * time.Second +
        time.Duration(decimals / 100) * time.Millisecond

    rate := Rate{
        Amount: amount,
        Period: period,
    }
    return rate, nil
}

func parseInt(value string) int {
    if len(value) == 0 {
        return 0
    }
    parsed, err := strconv.Atoi(value)
    if err != nil {
        return 0
    }
    return parsed
}
