# This file is used to specifically build portal backend image
FROM node:21-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node ./services ./services
COPY --chown=node:node ./web-portal/backend/  ./web-portal/backend/

# RUN npm i prisma @prisma/client
# RUN cd ./web-portal/backend && RUN corepack enable pnpm pnpm install
# RUN cd ./web-portal/backend && npx prisma generate
# RUN cd ./web-portal/backend && npx pnpm build

# RUN npm i prisma @prisma/client
RUN corepack enable pnpm && cd ./web-portal/backend && pnpm i && pnpm build
FROM node:21-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/.generated ./.generated

EXPOSE 4000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
