FROM node:18-alpine as base

WORKDIR /home/node/app

COPY package*.json .
RUN npm install

RUN npm i

COPY . .