FROM node:21

WORKDIR /app

COPY . .

RUN yarn install && yarn build

EXPOSE 8000

CMD ["yarn", "start"]
