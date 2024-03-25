FROM node:18 AS build

WORKDIR /app


COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# INJECT ENV VARIABLES AT BUILD TIME
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_RPC_ENDPOINT
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_APP_URL

RUN corepack enable pnpm && pnpm i && pnpm build


FROM node:18 As production

ENV NODE_ENV production


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copy the bundled code from the build stage to the production image
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
