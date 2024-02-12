default:
    @just --list

test:
    @just gateway/test

generate:
    cd ./web-portal/backend && pnpm install && npx prisma generate
migrate:
    cd ./web-portal/backend && pnpm install && npx prisma migrate dev


dev-backend:
    cd ./web-portal/backend && pnpm install && pnpm start
build-backend:
    cd ./web-portal/frontend && pnpm install && pnpm build
serve-backend:
    cd ./web-portal/backend && pnpm install && pnpm start:prod


dev-frontend:
    cd ./web-portal/frontend && pnpm install && pnpm dev
build-frontend:
    cd ./web-portal/frontend && pnpm install && pnpm build
serve-frontend:
    cd ./web-portal/frontend && pnpm install && pnpm start
