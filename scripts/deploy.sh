#!/bin/bash

set -e

MYSQL_IMAGE="mysql:5.7"
DB_NETWORK="db_network"

function require-env-var {
  local name=$1
  if [[ -z ${!name} ]]; then
    echo "Error: $1 has not been defined, please check your environement variables"
    exit 1
  else
    echo "Found $1"
  fi
}

function container-id {
  docker container list --quiet --filter "name=$1"
}

function network-id {
  docker network list --quiet --filter "name=$1"
}

function volume-name {
  printf "mysql_%s_data" $DEPLOYMENT_MODE
}

function instnace-already-running {
  [[ ! -z "$(container-id $CLIENT_CONTAINER_NAME)" ]] || \
  [[ ! -z "$(container-id $SERVER_CONTAINER_NAME)" ]]
}

echo "Checking environment variables..."
# System Variables
require-env-var "DEPLOYMENT_MODE"
require-env-var "CLIENT_CONTAINER_NAME"
require-env-var "SERVER_CONTAINER_NAME"
require-env-var "MYSQL_ROOT_PASSWORD"
require-env-var "COMPOSE_FILE"

# Cradle Server Variables
require-env-var "DB_USERNAME"
require-env-var "DB_PASSWORD"
require-env-var "DB_HOSTNAME"
require-env-var "DB_PORT"
require-evn-var "DB_NAME"
require-env-var "EMAIL_USER"
require-env-var "EMAIL_PASSWORD"
echo "Done!"
echo ""

echo "Begining deployment: $DEPLOYMENT_MODE"
echo ""

echo "Searching for database instance..."
if [[ -z "$(container-id $DB_NAME)" ]]; then
  echo "Not found"

  echo "Searching for database network..."
  if [[ ! -z "$(network-id $DB_NETWORK)" ]]; then
    echo "Not found"

    echo "Creating database network..."
    docker network create $DB_NETWORK
    echo "Done!"
  else
    echo "Found!"
  fi

  echo "Creating a new database instance..."
  docker run \
    --name $DB_NAME \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
    -e MYSQL_USER=$DB_USERNAME \
    -e MYSQL_PASSWORD=$DB_PASSWORD \
    -p "$DB_PORT:3306"
    --mount "type=volume,src=$(volume-name),dst=/var/lib/mysql" \
    --network $DB_NETWORK \
    --detatch \
    $MYSQL_IMAGE
  echo "Done!"
else
  echo "Found!"
fi
echo ""

echo "Searching for existing containers..."
if instance-already-running; then
  echo "Found"
  echo "Tearing down existing instances..."
  docker-compose --file $COMPOSE_FILE down
  echo "Done!"
else
  echo "Not found, ready for a new deployment"
fi
echo ""

echo "Deploying..."
docker-compose up --force-recreate --detatch
echo "Done!"

echo "Finished deployment: $DEPLOYMENT_MODE!"
