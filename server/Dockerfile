# pull official base image
FROM python:3.7.6-buster

# create new directories in container
RUN mkdir /usr/src/server
RUN mkdir /usr/src/client

# set work directory
WORKDIR /usr/src/server

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN uname -a
RUN python --version
RUN pip install --upgrade pip
COPY ./server/requirements.txt /usr/src/server/requirements.txt
RUN pip install -r requirements.txt

# copy server app code to container
COPY ./server /usr/src/server

# TODO: remove after Nginx is set up to serve static files
# copy client app code to container
COPY ./client /usr/src/client