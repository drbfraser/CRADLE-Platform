#!/bin/bash

RED='\033[1;31m'
BLUE='\033[1;36m'
COLOR_OFF='\033[0m'

# exit if there is a failed command
set -e

echo -e "${BLUE}"
echo -e "Cradle Continuous Deployment Setup"
echo -e "This script must be run as root or with sudo. It is only supported on Ubuntu Server 20.04."
echo -e "${COLOR_OFF}${RED}"
echo -e "NOTE: This script only supports having 1 Gitlab runner for staging deployment and 1 Gitlab runner for production deployment."
read -p "Continue (y/n)? " CONT
echo -e "${COLOR_OFF}"

if [ "$CONT" != "y" ]; then
    exit 0
fi

echo -e "${BLUE}Updating, upgrading and installing required packages...${COLOR_OFF}\n"

apt update -y
apt upgrade -y
apt install git docker.io docker-compose

echo -e "\n${BLUE}Starting the Docker service and setting Docker to automatically start at boot${COLOR_OFF}\n"

systemctl start docker
systemctl enable docker

# Install Gitlab Runner: https://docs.gitlab.com/runner/install/linux-repository.html
echo -e "${BLUE}Installing Gitlab runner...${COLOR_OFF}\n"
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
export GITLAB_RUNNER_DISABLE_SKEL=true; sudo -E apt-get install gitlab-runner

usermod -aG docker gitlab-runner

echo -e "${BLUE}"
echo -e "Registering Gitlab Runner"
echo -e "The URL and token can be found in Settings -> CI/CD -> Runners"
echo -e "The tags must be 'deploy,shell' for staging and 'deploy,shell-prod' for production."
echo -e "The executor must be 'shell'"
echo -e "${COLOR_OFF}"

gitlab-runner register

mkdir -p /var/cradle

echo -e "\n${BLUE}Please enter the domain for this Cradle installation (blank to use IP over HTTP only):${COLOR_OFF}"
RAND_PASSWORD=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
RAND_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
read;
echo -e "CADDY_DOMAIN=${REPLY:-:80}\nDB_USERNAME=user\nDB_PASSWORD=${RAND_PASSWORD}\nJWT_SECRET_KEY=${RAND_SECRET}\n" > /var/cradle/.env

echo -e "\n${BLUE}Finished! Run the Gitlab deploy pipeline to deploy CRADLE.${COLOR_OFF}\n"