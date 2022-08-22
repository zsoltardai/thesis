FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm install --global --force yarn

RUN yarn install

COPY next.config.js ./next.config.js

COPY public ./public

COPY pages ./pages

COPY styles ./styles

COPY components ./components

COPY lib ./lib

COPY store ./store

COPY key.key ./key.key

COPY key.pub ./key.pub

COPY .env.local ./.env.local

CMD ["yarn", "dev"]
