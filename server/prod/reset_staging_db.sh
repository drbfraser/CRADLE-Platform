#!/bin/bash

# Exit immediately upon any failed command
set -e

echo "Dropping all tables..."
docker exec staging-cradle python manage.py drop_all_tables

echo "Creating the tables..."
docker exec staging-cradle flask db upgrade

echo "Seeding database tables"
docker exec staging-cradle python manage.py seed

echo "Done."