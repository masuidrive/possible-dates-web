FROM node:10

WORKDIR /usr/src/app

ADD package.json /usr/src/app/package.json
RUN yarn install

COPY . /usr/src/app

EXPOSE 3000
