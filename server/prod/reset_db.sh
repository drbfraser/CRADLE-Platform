#!/bin/bash

# Exit immediately upon any failed command
set -e

PROD_SERVER_CONTAINER_NAME=cradle
SERVER_CONTAINER_NAME=$1

if [[ $SERVER_CONTAINER_NAME == $PROD_SERVER_CONTAINER_NAME ]] 
then
    read -p "Confirm that you would like to reset all data in the the production database, this action cannot be reversed. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]];
    then
        # exit out of if/else and delete production data
        echo "Deleting data in production db";
    else
        exit 0
    fi
fi

echo "Resetting database."
docker exec $SERVER_CONTAINER_NAME python manage.py drop_all_tables && flask db upgrade && python manage.py seed

# echo "Dropping all tables..."
# docker exec $SERVER_CONTAINER_NAME python manage.py drop_all_tables

# echo "Creating the tables..."
# docker exec $SERVER_CONTAINER_NAME flask db upgrade

# echo "Seeding database tables"
# docker exec $SERVER_CONTAINER_NAME python manage.py seed

echo "Done."