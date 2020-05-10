#!/bin/bash

# This file should only be run in docker containers, using reset_db.sh
# Confirmation to delete a db will occur in reset_db.sh

# Exit immediately upon any failed command
set -e

echo "Dropping all tables..."
python manage.py drop_all_tables

echo "Creating the tables..."
flask db upgrade

echo "Seeding database tables"
python manage.py seed