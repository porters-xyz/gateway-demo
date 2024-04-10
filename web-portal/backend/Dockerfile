# This file is used to specifically build portal backend image
FROM porters-schema As build

WORKDIR /usr/src/app

COPY --chown=node:node ./  ./web-portal/backend/


RUN corepack enable pnpm && cd ./web-portal/backend && pnpm i && pnpm build
FROM node:21-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/web-portal/backend/.generated ./.generated

RUN npm i

EXPOSE 4000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
