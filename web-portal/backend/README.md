## Description

[NestJS](https://github.com/nestjs/nest) backend for web-portal of gateway implementation.

## Installation

```bash
$ pnpm install
```

## DB Setup (currently using local sqlite db)
$ npx prisma generate

$ npx prisma migrate dev

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Info

Nest is an MIT-licensed open source project.
