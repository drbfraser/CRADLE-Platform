## Server Environment Variables

Note that some of these are set in the Docker Compose file for consistency. Only `DB_USERNAME` and `DB_PASSWORD` are stored in a deployment-specific `.env` file, for security.

- `DB_USERNAME` - the username for connecting to MySQL
- `DB_PASSWORD` - the password for connecting to MySQL
- `DB_HOSTNAME` - the hostname of the database.
- `DB_PORT` - the port of the host specified by `DB_HOSTNAME` to connect to.

## Environment File

Create a `.env` file in the `cradle-platform` directory (the values may be any arbitrary values):

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
```
