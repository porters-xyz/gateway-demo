FROM node:21-alpine

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN apk add --no-cache bash

RUN npm install -g ts-node typescript @types/node prisma@latest @prisma/client

RUN npx prisma generate --schema=./schema.prisma

CMD ["npx", "prisma", "generate", "--schema=./schema.prisma"]