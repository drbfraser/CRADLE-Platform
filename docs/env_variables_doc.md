## Server Environment Variables

Note that the majority of these are set in the Docker Compose file for consistency. Only `DB_USERNAME`, `DB_PASSWORD` and `JWT_SECRET_KEY` are stored in environment variables, for security.

* `DB_USERNAME` - The username of the newly created user that has access to your app database
* `DB_PASSWORD` - The password of the root user, and the newly created user that has access to your app database
* `DB_HOSTNAME` - The hostname of the database.
* `DB_PORT` - The port of the host specified by `DB_HOSTNAME` to connect to.
* `JWT_SECRET_KEY` - the secret key used by Flask for access tokens
* `EMAIL_USER` - The username of an email used for the SMTP server. Preferably use a Gmail account
* `EMAIL_PASSWORD` - The password to the corresponding email fo the SMTP server

## Environment File
Create a `.env` file in the `cradle-platform` directory (the values may be any arbitrary values):

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
JWT_SECRET_KEY=supersecretkey
```
