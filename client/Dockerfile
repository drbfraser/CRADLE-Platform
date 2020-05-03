# pull latest official node image as base image
FROM node:10

# set work directory
WORKDIR /usr/src/app

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install dependencies
COPY package*.json ./
RUN npm install

COPY . . 