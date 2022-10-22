FROM python:3.9.1-buster

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
 
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

RUN mkdir -p /home/myflask/logs; \
    mkdir -p /uploads; \
    useradd --create-home myflask; \
    chown -R myflask:myflask /home/myflask/logs; \
    chown -R myflask:myflask /uploads;

WORKDIR /home/myflask
USER myflask

COPY . .