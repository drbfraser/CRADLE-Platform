#!/bin/bash

# Exit immediately upon any failed command
set -e

echo "Creating the tables..."
docker exec cradle flask db upgrade

echo "Seeding database tables"
docker exec cradle python manage.py seed

echo "Done."