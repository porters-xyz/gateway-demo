FROM node:21-alpine AS build

ENV NEXT_TELEMETRY_DISABLED 1


RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

ENV PORT 3000
EXPOSE 3000



CMD ["npx","next","start"]
