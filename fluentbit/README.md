## Docker volume home:
- In Linux, the path to volume directory is `/var/lib/docker/volumes`
- In Windows(wsl2), it is `/mnt/wsl/docker-desktop-data/version-pack-data/community/docker/volumes`

## Logs we keep track of:
1. Flask logs (`${DOCKER_VOLUME_HOME}/cradle-platform_flask_logs/_data`):\
    Configured in `server/gunicorn.conf.py` and `server/config.py`
   - ./access.log - Records http requests
   - ./error.log
   - ./application.log 

2. Caddy logs (`${DOCKER_VOLUME_HOME}/cradle-platform_caddy_logs/_data`):\
   Configured in `caddy/Caddyfile`
   - ./global.log

3. MySQL logs (`${DOCKER_VOLUME_HOME}/cradle-platform_mysql_logs/_data`):\
   Configured in `mysql.cnf`
   - ./general.log
   - ./slow.log - Records slow queries
   - ./error.logs


## ENV VARIABLE:
[INPUT] \
PATH: This is a path to log file directory; \
`${DOCKER_VOLUME_HOME}/<volume-name>/_data`

## Why do we have so many fluent-bit config files?: 
I wanted one `fluent-bit.conf` in `fluentbit/config` and include output configs according to their environment(development, local, staging, and prod);`@INCLUDE ${OUTPUT_CONF_DIR}` However, this is currently not supported, thus multiple fluent-bit config files;
https://github.com/fluent/fluent-bit/issues/2020 

This could be a future improvements.

## How to test locally
**Prerequisite:** \
If you want to build caddy contianer locally, you need frontend.tar.gz. You can either build it yourself locally or save time by downloading the artifact(frontend.tar.gz) from our latest Gitlab CI's successful build job. e.g. https://csil-git1.cs.surrey.sfu.ca/415-cradle-sl/cradle-platform/-/pipelines (Click on the 3 dots on the right of each pipeline)

**Testing:** \
Run fluentbit contianer separately from the rest. This is to test if the fluentbit container is properly recording where it stopped collecting logs with `DB` field.

To run just Fluentbit: \
`IMAGE_TAG=log DOMAIN=localhost  docker compose -f docker-compose.yml -f docker-compose.deploy.yml up --build fluentbit`

To run the rest services: \
`IMAGE_TAG=log DOMAIN=localhost  docker compose -f docker-compose.yml -f docker-compose.deploy.yml up --build flask caddy mysql`

You should see that fluentbit is collecting its logs under `fluentbit/logs`. 

**NOTE:**
* If you have already built the image, you don't need `--build` flag.



## NOTE: We'll be creating a new guide doc for logging. This README.md may be temporary and move to there.