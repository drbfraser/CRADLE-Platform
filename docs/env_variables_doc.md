## Server environment variables

* `DB_USERNAME` - The username of the newly user that has access to your app database
* `DB_PASSWORD` - The password of the root user, and the newly created the user that has access to your app database
* `DB_HOSTNAME` - The hostname of the database. 
  - If using dockerized deployment, this value should be set to `db` which is the service name of the `mysql` container. 
  - If using connecting the app to a MySQL server running on your development host machine, set this value to `localhost1
* `DB_PORT` - The port of the host specified by `DB_HOSTNAME` to connect to. When using dockerized environment, this value must be set to `3306`. Note that if using a MySQL server running on your host machine, the default port is `3306`
* `EMAIL_USER` - The username of an email used for the SMTP server. Preferably use a Gmail account
* `EMAIL_PASSWORD` - The password to the corresponding email fo the SMTP server

## Development
Example `.env` file:
```
DB_USERNAME=student
DB_PASSWORD=123456
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=student@gmail.ca
EMAIL_PASSWORD=p4sSw0rd
```
Notes: 
- This file is to be created in the `server` directory
- ensure a symlink is created for this file from server/.env to root/.env, see the [Dev Environment Setup Guide](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/New-Dev-Environment-Setup-Guide#2-set-up-environment-variables) for more details

# Production
The below files are not required for the local development machine, but is required in the project repo on the production server <br><br>
Example `.env.prod` file:
```
DB_USERNAME=student
DB_PASSWORD=123456
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=student@gmail.ca
EMAIL_PASSWORD=p4sSw0rd
```
Notes: 
- this file is to be created in the `server` directory
- `DB_HOSTNAME` should always be set to `db` unless the mysql service name in `docker-compose.prod.yml` changes or if using an alternate MySQL server
- `DB_PORT` should always be set to `3306` unless connecting to an external MySQL server

Example `.env.prod.db` file:
```
MYSQL_ROOT_PASSWORD=p4sSw0rd
MYSQL_DATABASE=cradle
MYSQL_USER=produser
MYSQL_PASSWORD=p4sSw0rd
```

Variable definitions:
- `MYSQL_ROOT_PASSWORD` - the password of the root user in the dockerized MySQL production database
- `MYSQL_DATABASE` - The name of database to create on image startup. This value should match the `DB_NAME` variable in `.env.prod`
- `MYSQL_USER` - (optional) the name of the user to create to grant access to the created `MYSQL_DATABASE`. This variable should match the `DB_USERNAME` variable in `.env.prod` unless specified as `root`
- `MYSQL_PASSWORD` - (optional) the password to `MYSQL_USER`, should be set then `MYSQL_USER` is set

Notes: 
- For more details and other available Environment Variables, check out the Environment Variables section of the [MySQL DockerHub image](https://hub.docker.com/_/mysql)