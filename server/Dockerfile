# pull official base image
FROM python:3.9.1-buster

# create and set working directory
RUN mkdir /usr/src/server
WORKDIR /usr/src/server

# create file upload directory
RUN mkdir -p /srv/www/admin

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt /usr/src/server/requirements.txt
RUN pip install -r requirements.txt
