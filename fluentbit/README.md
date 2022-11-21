## Docker volume home:
- In Linux, the path to volume directory is `/var/lib/docker/volumes`
- In Windows(wsl2), it is `/mnt/wsl/docker-desktop-data/version-pack-data/community/docker/volumes`

## Logs we keep track of:
1. Flask logs (`${DOCKER_VOLUME_HOME}/cradle-platform_flask_logs/_data`):\
    Configured in `server/gunicorn.conf.py` and `server/config.py` \
    Gunicorn doc: https://docs.gunicorn.org/en/stable/settings.html#logging \
    Only application.log is configured to output to both files and sdtout at the moment. \
    All worker process is logging to the same application.log file. It's not separated. 
   - ./access.log - Http requests (Can be formatted) Configured at `server/gunicorn.conf.py`
   - ./error.log - Configured at `server/gunicorn.conf.py`
   - ./application.log - Configured at `server/config.py`

2. Caddy logs (`${DOCKER_VOLUME_HOME}/cradle-platform_caddy_logs/_data`):\
   Configured in `caddy/Caddyfile`
   Not possible to have multiple log outputs when configured with Caddyfile(https://caddy.community/t/multiple-log-files/11295/2). We need to use JSON configuration.
   - ./runtime.log - Caddy's runtime log like start up logs (Configured at a global block) https://caddyserver.com/docs/caddyfile/options#log 
   - ./access.log - Http requests logs (Configured at a site(domain) block) https://caddyserver.com/docs/caddyfile/directives/log#output-modules

3. MySQL logs (`${DOCKER_VOLUME_HOME}/cradle-platform_mysql_logs/_data`):\
   Configured in `mysql.cnf`
   - ./general.log - Established client connections and statements received from clients (Can be output to a file or DB table)
   - ./slow.log - Queries that took more than long_query_time seconds to execute (Can be output to a file or DB table)
   - ./error.logs - Problems encountered starting, running, or stopping mysqld (Can be output to a file, stderr, etc)


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

You can generate more logs by interacticng with the frontend using Caddy. Access it with `http://${DOMAIN}`. For example, in this case, it will be `http://localhost`.

If this is your first time, you'll see an error page saying "Your connection isn't private". Click on "Advanced" button on the left bottom of that message and click on "Continue to localhost (unsafe)".

**NOTE:**
* If you have already built the image, you don't need `--build` flag.



## NOTE: We'll be creating a new guide doc for logging. This README.md may be temporary and move to there.