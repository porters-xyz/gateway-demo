ARG REDIS_VERSION=7.2
FROM redis:${REDIS_VERSION}-alpine

COPY start-redis-server.sh /usr/bin/start-redis-server.sh

CMD ["/usr/bin/start-redis-server.sh"]
