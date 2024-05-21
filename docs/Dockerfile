FROM node:18 AS build

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

ENV PORT 3000
EXPOSE 3000



CMD ["npx","next","start"]
