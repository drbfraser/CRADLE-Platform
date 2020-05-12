#!/bin/bash

# This file should only be run in docker containers, using reset_db.sh
# Confirmation to delete a db will occur in reset_db.sh

echo "Dropping all tables..."
python manage.py reset_db

echo "Creating the tables..."
flask db upgrade

echo "Seeding database tables"
python manage.py seed