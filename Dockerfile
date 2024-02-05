FROM node:16.18-alpine As development
WORKDIR /usr/src/app
COPY package*.json ./
COPY .npmrc ./
RUN npm install --only=development
COPY . .
RUN npm install --save glob
RUN npm run build

FROM node:16.18-alpine as production

LABEL AUHTOR="Renato Tejada"

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
