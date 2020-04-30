#!/bin/sh

echo "Waiting for MySQL..."

echo "DBHOST:" $DB_HOSTNAME
echo "DB_PORT:" $DB_PORT

while ! nc -z $DB_HOSTNAME $DB_PORT; do
    sleep 0.5
done

echo "MySQL started"

exec "$@"