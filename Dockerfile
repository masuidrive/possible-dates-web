FROM node:10

WORKDIR /usr/src/app

ADD package.json /usr/src/app
ADD yarn.lock /usr/src/app
RUN yarn install


COPY . /usr/src/app

EXPOSE 3000
