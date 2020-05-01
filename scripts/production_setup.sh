#!/bin/bash

# Exit immediately upon any failed command
set -e

echo "Starting Cradle Production Setup"

echo "Please enter password to switch to root user."
sudo su

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

echo "Installing cradle-platform to /var/wwww"
echo "Please enter your gitlab username and password"
echo "WARNING: these git credentials will be saved on this server in ~/.git-credentials for future us by the CI/CD system and will be publically visible to other users that have root access to this machine."
mkdir /var/www && cd /var/www
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git cradle-platform
git config --global credential.helper store
git pull

echo "Spinner up docker containers..."
cd /var/www/cradle-platform
docker-compose -f docker-compose.prod.yml up -d

echo "Initializing database"
docker exec cradle flask db init

echo "Creating the tables..."
docker exec cradle flask db upgrade

echo "Seeding the initial user information..."
python manage.py seed

echo "Cradle Production Setup completed successfully! Navigate to port 80 to check out the app."