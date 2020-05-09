#!/bin/bash

# This script starts the MySQL container using the environment variables specified in ../../.env.prod.db, relative to this file
# If the mysql container is already running, do nothing, else remove any existing mysql container and start a new mysql container with the latest mysql image

echo $0

db_env_file_path="$(dirname $(dirname $(realpath $0)))/.env.prod.db"
echo $db_env_file_path

if ! nc -z 127.0.0.1 3307;
then
    docker rm mysql
    docker run --name mysql -v mysql_data:/var/lib/mysql -p 127.0.0.1:3307:3306 --env-file $db_env_file_path --restart always -d mysql:latest
fi