# Redis gateway cache

This service is set up for the gateway to track request level data in a
performant way. There is meant to be a redis cache per region so that it is low
latency for all nodes running there. This requires nodes to be independent and
that eventual consistancy with the postgres database to be feasible.
