package db

import (
    "log"

    "porters/common"
)

type CacheTask struct {
    
}

type CacheCombiner struct {
    common.SimpleCombiner
}

func (c *CacheCombiner) runner() func() {
    return func() {
        
    }
}

func (t *CacheTask) Run() {
    db := getCache()
    log.Println("db:", db)    
}
