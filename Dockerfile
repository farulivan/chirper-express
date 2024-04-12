FROM node:20-alpine3.18

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install

COPY . .

ENTRYPOINT [ "npm" ]

CMD [ "run", "start" ]