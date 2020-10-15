# Manual Deployment Guide

Note that it is recommended you set up the staging / production deployments using continuous deployment rather than manually.

## To Setup

1. SSH into the server you'd like to deploy on.
2. Change into your home directory (cd `~`)
3. Type `nano setup_manual.sh`
4. Copy and paste the contents of `scripts/setup_manual.sh` into nano
5. `Ctrl-X` + `y` to save
6. `chmod +x setup_manual.sh` to set the script as runnable
7. Run `./setup_manual.sh` and follow the steps.

## To Update

1. SSH into the server
2. `cd ~/cradle-platform`
3. `git reset --hard`
4. `git pull`
5. `cd client`
6. `npm run build`
7. `cd ../`
8. `docker-compose -f docker-compose.yml -f docker-compose.deploy.yml up --force-recreate -d`