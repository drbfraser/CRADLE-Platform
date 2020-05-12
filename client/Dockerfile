# pull latest official node image as base image
FROM node:10

# create work directory in container
RUN mkdir /usr/src/client

# set work directory
WORKDIR /usr/src/client

# add `/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/client/node_modules/.bin:$PATH

# add app
COPY . ./

# install dependencies
RUN npm install
