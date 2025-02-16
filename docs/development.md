# Developer Onboarding

## Development Environment Setup

### 1. Install Required Programs

You'll need to install Docker and NodeJS + NPM.

Follow this guide to install Docker: https://docs.docker.com/get-docker/

- If on Windows 10 Home, you'll need to first [enable WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
- If you're on Windows / macOS, follow Docker Desktop's "Getting Started" guide. It'll introduce you to the basics of Docker and give you an easy way to verify it's correctly installed.

Install NodeJS 16 LTS from here: https://nodejs.org/en/

### 2. Cloning the Repo

Prior to cloning the repo, ensure you

- have [generated an SSH key on your computer, registered it with GitHub, and loaded it into your ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- are connected to internet via SFU wifi or [VPN](https://sfu.teamdynamix.com/TDClient/255/ITServices/Requests/ServiceDet?ID=2613)

Then run:

```
git clone git@github.sfu.ca:cradle-project/Cradle-Platform.git
```

### 3. Set up Environment Variables

Create a file named `.env` (extension only file) in the `cradle-platform` directory containing the following:

```
DB_USERNAME=<A_DATABASE_USERNAME>
DB_PASSWORD=<A_DATABASE_PASSWORD>
LIMITER_DISABLED=<True to disable or False to enable>
```

For example:

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
LIMITER_DISABLED=True
```

Note you may set these to any arbitrary values.

In case connecting with cradle-sms-relay is needed, you should append your emulator's phone number to the `.env` file.

For example, add this line at the end of the lines mentioned above:

```
EMULATOR_PHONE_NUMBER=<PHONE_NUMBER_OF_EMULATOR_RUNNING_CRADLE_MOBILE_APP>
```

Your emulator's phone number will very likely be +15555215554 or +15555215556. The former is assigned to the first emulator that starts. The latter is assigned to the second emulator that starts.

For example, let's say that you start the CRADLE Mobile app's emulator SECOND (this is AFTER you start the emulator for SMS relay), assuming you have no other emulators open before opening the emulator for SMS relay:

```
EMULATOR_PHONE_NUMBER=+15555215556
```

Or in full:

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
LIMITER_DISABLED=True
EMULATOR_PHONE_NUMBER=+15555215556
```

Note: The "+1" is the country code, and is required.

### 4. Set up the user pool

Create a file named `.env.cognito_secrets`. This file will be used to store secrets
needed to connect with the AWS Cognito user pool. Put the access key and secret access key
that Dr. Brian gave you in this file. If you have not been provided with these, you will
need to ask Dr. Brian for them.

```
COGNITO_AWS_ACCESS_KEY_ID=<access-key-id>
COGNITO_AWS_SECRET_ACCESS_KEY=<secret-access-key>
```

To create a user pool for development purposes, a python script is provided. This
script will programmatically create the remote user pool using the AWS SDK and will
create a new file populated with the environment variables needed to connect to it.

To run the script, you will need to install the AWS SDK for python. It is recommended
that you use a virtual environment to do so, rather than installing it globally.
[https://docs.python.org/3/library/venv.html](https://docs.python.org/3/library/venv.html)

To create a virtual environment, run `python -m venv .venv`
You will then need to activate the environment.

If using Windows Powershell, run:

```
.venv/Scripts/activate.ps1
```

If using CMD, run:

```
.venv/Scripts/activate.bat
```

If on MacOS or Linux, run:

```
source .venv/bin/activate
```

If you are using Git Bash on Windows, run:

```
source .venv/Scripts/activate
```

You should then see (.venv) appear before your terminal path.

In the scripts folder of the project, there is a `requirements.txt` with the necessary dependencies.

You can then install the Python dependencies from the project's root directory
by running:

```
pip install -r scripts/requirements.txt
```

Once the dependencies are installed, running the script will create a remote
user pool named `cradle_user_pool-<your-name>`. Where `<your-name>` is the
command line argument that you provide to the script. It is recommended that
you use a unique identifier such as your SFU computing ID to avoid potential
naming conflicts.

```
python scripts/create_user_pool.py <your-name>
```

This will also create a file named `.env.cognito_secrets-<your-name>` in the
project's root directory. This file has been populated with the values necessary
to connect to your user pool. Don't lose these! If you lose these values, you will
need to ask Dr. Brian to delete your user pool so you can create a new one. The
project's code will be looking for these values in the `.env.cognito_secrets` file,
so you will need to copy them from `.env.cognito_secrets-<your-name>` to
`.env.cognito_secrets`.

You can copy the contents from this new file to `.env.cognito_secrets` by running:

```
cat .env.cognito_secrets-<your-name> > .env.cognito_secrets
```

It is strongly recommended that you keep the `.env.cognito_secrets-<your-name>`
file as a backup.

### 5. Spin up the Docker Containers

From your OS's terminal (such as PowerShell in Windows) run:

```
docker compose up
```

All the Docker images will build, then the Docker containers will start. You may add the `-d` option to run the Docker containers in the background, although that makes it more difficult to see log messages from Flask and MySQL.
(If the Docker can not run properly, try to close the MySQL tasks in the task manager and run it again)

If there are issues starting up Docker containers after recent changes to package requirements, refer to the [Package Changes](https://github.sfu.ca/cradle-project/Cradle-Platform/blob/main/docs/development.md#package-changes) section for troubleshooting steps.

Now it's time to run the database migrations. Once the containers have fully started, run the following command in a new terminal window.

```
docker exec cradle_flask flask db upgrade
```

### 6. Seeding Data

Data seeding is handled by the `manage.py` script in the `server` directory. There are 3 data seeding options which give various amounts of data:

- `seed_minimal`: seeds the bare minimum amount of data to get the application running, useful if you want to debug something without having to trudge through unrelated data
- `seed_test_data`: seeds data required to run the unit tests
- `seed`: seeds a generous amount of random data

In order to seed data, run `docker exec cradle_flask python manage.py <SEED_OPTION>` where `<SEED_OPTION>` is one of the options listed above. For example:

```
docker exec cradle_flask python manage.py seed_test_data
```

### 7. Run the NPM Dev Server

NPM is not run inside Docker (due to poor filesystem performance), so you'll need to run the following to start the NPM development server:
(Make sure you have `NPM 7`)

```
cd client
npm install
npm start
```

If installation fails due to out-dated dependencies, try `npm install --legacy-peer-deps`.

If there are a lot of vulnerabilities, try to fix them by running `npm ci` to install directly from the `package-lock.json`. Be careful with `npm audit fix`, as it can introduce more vulnerabilities. Consider committing your changes first, and then attempting a combination of `npm audit fix`, `npm audit fix --legacy-peer-deps`, and `npm audit fix --force`.

If there are errors during `npm start`, try running `npm ci` to install directly from the `package-lock.json`.

### Start Developing!

- Navigate to http://localhost:3000/ to check out the React client running in your browser, communicating to the server hosted at http://localhost:5000/ which is communicating with MySQL!
- You will be able work on the client-side and server-side code, all while being able to enjoy hot-reloading!

---

## Development

### Automated Testing

See the testing guide at:

### Backend Onboarding Guide - Useful Documentation to Get Started

For a comprehensive guide to backend development, please refer to the "Backend-Onboarding-Doc" located in the shared CRADLE Docs Google Drive under **Guides/Tutorials > Backend-Onboarding-Doc**.

This document provides all the essential information for new backend developers to get started, offering a detailed overview of the codebase and an explanation of

- What each each file does
- Step-by-step instructions for running automated tests
- Creating and utilizing Pydantic test models
- Accessing, migrating, or resetting database data

### General Tips

- Make sure to check out the API documentation at <http://localhost:5000/apidocs>

- Once the initial setup is completed, you'll only need to run `docker compose up` in the `cradle-platform` directory and `npm start` in the client directory to run Cradle.

- If using Docker Desktop, you may also start / restart / stop the containers from within the GUI.

### Code Formatting

In order to pass the pipeline (and for readability) your code must be properly formatted.

#### Frontend

Frontend code is formatted using Prettier and must pass ESLint. Run `npm run format` in the `client` directory to format all frontend files and run a lint check.

#### Backend

Backend code is formatted using Ruff. With your Docker containers running, run `docker exec cradle_flask ruff format .` to format all backend files.

### Package Changes

It's always best to avoid adding additional dependencies to the project if possible. Try to use existing packages rather than installing a new one.

#### Frontend

- New packages can be installed in the frontend by running `npm install PACKAGE_NAME` in the `client` folder
- If another team member has installed a new package, you'll need to run `npm install` (or `npm install --legacy-peer-deps`)

#### Backend

- New packages can be installed in the backend by running `docker exec cradle_flask pip install PACKAGE_NAME` with your Docker containers running
- If another team member has installed a new package, you'll need to run `docker compose build` with your Docker containers off

### Database Changes

- If working on the backend, when you make database changes you'll need to create migrations: run `docker exec cradle_flask flask db migrate` to do so

- If database changes have been made (by you or other team members), run `docker exec cradle_flask flask db upgrade` to upgrade your database schema

### Reseeding your Database

If something has gone wrong and you're having issues with your database, you can always wipe it and reseed. To do so, with your Docker containers off:

1. Run `docker container ls -a` and look for a container named `cradle_mysql` or similar
2. Remove the container by running `docker container rm cradle_mysql` (using the container name identified above)
3. Run `docker volume ls` and look for the volume associated with the MySQL database. It's likely named `cradle-platform_mysql_data` or something similar
4. Remove the Docker volume: `docker volume rm cradle-platform_mysql_data` (using the volume name identified above)
5. Start your Docker containers: `docker compose up`
6. Upgrade your database schema: `docker exec cradle_flask flask db upgrade`
7. Reseed: `docker exec cradle_flask python manage.py seed` (see setup above for more seed options)

### Useful Tools / Dev Software

- [Postman](https://www.getpostman.com/):
  - Used to test API endpoints and send HTTP requests with a GUI
  - Check out the [Postman Workspace Setup Guide](https://github.sfu.ca/cradle-project/Cradle-Platform/wiki) for how to set up the Postman Workspaces to begin testing the project REST APIs
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - allows you to observe what components make up the webpage/DOM
  - allows you to observe the live values of props and state in components
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - allows you to view and debug how data is being passed to and from Redux

### Troubleshooting

#### SMS Relay crashing and not working

There is a rare case where the database will not seed properly and sending a response from the Flask server back to the SMS relay app will crash the SMS relay app. First, verify what the problem is by accessing Docker container's logs. Then, if the problem is that there is no matching phone number, you may need to manually modify values inside the database.

For example, you might have to run this MySQL query in the Docker container running MySQL if the issue is that `+15555215556` is not in the `user_phone_number` table, and that is what the Flask server is expecting.

```sql
UPDATE user_phone_number
SET number = "+15555215556"
WHERE number = "5555215556";
```

Alternatively, if this does not work, try filtering on the `id` field instead. You can find all of the IDs by running `SELECT * FROM user_phone_number;`. And then filter:

```sql
UPDATE user_phone_number
SET number = "+15555215556"
WHERE id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
```

So far, the cause of this problem is not yet known and could not be reproduced.
