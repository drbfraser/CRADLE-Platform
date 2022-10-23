# ** If this file is changed, also change Dockerfile.deploy (no way to extend Dockerfiles :/) **

FROM python:3.9.1-buster

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
 
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

RUN useradd --create-home flaskUser
WORKDIR /home/flaskUser
USER flaskUser

COPY . .