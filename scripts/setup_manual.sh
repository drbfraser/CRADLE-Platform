#!/bin/bash

RED='\033[1;31m'
BLUE='\033[1;36m'
COLOR_OFF='\033[0m'

# exit if there is a failed command
set -e

echo -e "${BLUE}"
echo -e "Cradle Manual Deployment"
echo -e "This script must be run as root or with sudo."
echo -e "${COLOR_OFF}${RED}"
echo -e "WARNING: This is a manual deployment. You should likely set up CRADLE with CD instead (setup_cd.sh)."
echo -e "WARNING: If run on an existing Cradle instance, this might delete data."
read -p "Continue (y/n)? " CONT
echo -e "${COLOR_OFF}"

if [ "$CONT" != "y" ]; then
    exit 0
fi

echo -e "${BLUE}Updating, upgrading and installing required packages...${COLOR_OFF}\n"

apt update -y
apt upgrade -y
apt install git docker.io docker-compose nodejs npm

if [ ! -f ~/.ssh/id_ed25519.pub ]; then
    echo -e "\n${BLUE}Generating SSH key... please leave passphrase blank and save in default location.${COLOR_OFF}\n"
    ssh-keygen -t ed25519
fi

echo -e "\n${BLUE}Please copy and paste the following SSH key into Gitlab (Settings -> Repository):${COLOR_OFF}\n"

cat ~/.ssh/id_ed25519.pub

echo -e "\n${BLUE}Once added to Gitlab, press any enter to continue...${COLOR_OFF}"
read

cd ~
rm -rf cradle-platform
git clone git@csil-git1.cs.surrey.sfu.ca:415-cradle/cradle-platform.git
cd cradle-platform

git checkout master

echo -e "\n${BLUE}Starting the Docker service and setting Docker to automatically start at boot${COLOR_OFF}\n"

systemctl start docker
systemctl enable docker

if [ ! -f .env ]; then
    echo -e "${BLUE}Please enter the domain for this Cradle installation (blank to use IP):${COLOR_OFF}"
    RAND_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
    read;
    echo -e "CADDY_DOMAIN=${REPLY}\nDB_USERNAME=user\nDB_PASSWORD=${RAND_PASSWORD}\nDB_NAME=cradle\n" > .env

    echo -e "\n${BLUE}Removing previous Docker containers and volunes...${COLOR_OFF}\n"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    docker volume rm $(docker volume ls -q)
fi

echo -e "\n${BLUE}Building the frontend...${COLOR_OFF}\n"
cd client
npm run build
cd ../

echo -e "\n${BLUE}Spinning up Docker containers...${COLOR_OFF}\n"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo -e "\n${BLUE}Waiting for MySQL to start...${COLOR_OFF}"
sleep 10;

echo -e "${BLUE}Upgrading database schema...${COLOR_OFF}\n"
docker exec flask flask db upgrade

echo -e "\n${BLUE}"
echo -e "Data seeding options:"
echo -e "   0: No data seeding"
echo -e "   1: seed_minimal"
echo -e "   2: seed_test_data"
echo -e "   3: seed\n"
read -p "Enter an option: " OPTION
echo -e "${COLOR_OFF}"

case $OPTION in
    1)
        docker exec flask python ./manage.py seed_minimal
        ;;
    2)
        docker exec flask python ./manage.py seed_test_data
        ;;
    3)
        docker exec flask python ./manage.py seed
        ;;
esac

echo -e "\n${BLUE}Finished${COLOR_OFF}\n"