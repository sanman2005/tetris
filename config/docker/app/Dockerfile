FROM node:current-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install \
    && npm run build:production \
    && npm run server:production && echo "----- BUILD COMPLETE -----"

EXPOSE 9000

CMD [ "node", "dist/server.js" ]
