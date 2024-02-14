FROM node:21-alpine AS build

RUN apk add --no-cache libc6-compat
WORKDIR /app


COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm i -g pnpm
RUN corepack enable pnpm && pnpm i && pnpm build


FROM node:21-alpine As production

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copy the bundled code from the build stage to the production image
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3005
ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
