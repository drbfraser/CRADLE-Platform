#!/bin/bash

# This script will delete and then recreate the database.
# Use with caution. All data in the database will be lost.
# This script is intended for local development.

set -e

echo "Recreating the database..."

# Spin containers down.
docker compose down

# Delete database volume.
docker volume rm cradle-platform_mysql_data

# Spin containers back up.
docker compose up -d --wait

echo -e "\nWaiting for database to start...\n"
sleep 10

# Reseed the database.
docker exec cradle_flask flask db upgrade
docker exec cradle_flask python manage.py seed

docker compose down

echo -e "\nDatabase reset complete!\n"
