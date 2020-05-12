#!/bin/bash

# Exit immediately upon any failed command
set -e

echo "Starting Cradle Production Setup"
echo "This script must be run as a user with sudo privileges."

echo "Updating packages..."
apt-get update -y

echo "Uninstall old versions of docker"
apt-get remove docker docker-engine docker.io -y

echo "Installing docker"
apt install docker.io -y

echo "Starting the docker service and setting docker to automatically start at boot"
systemctl start docker
systemctl enable docker

docker --version

echo "Installing docker compose"
curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "Spinning up docker containers..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "Initializing database"
docker exec cradle flask db init

echo "Creating the tables..."
docker exec cradle flask db upgrade

echo "Cradle Production Setup completed successfully! Navigate to port 80 to check out the app."