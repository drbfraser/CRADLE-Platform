# Development Environment Setup

## 1. Install Required Programs

You'll need to install Docker and NodeJS + NPM.

Follow this guide to install Docker: https://docs.docker.com/get-docker/
  - If on Windows 10 Home, you'll need to first [enable WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
  - If you're on Windows / macOS, follow Docker Desktop's "Getting Started" guide. It'll introduce you to the basics of Docker and give you an easy way to verify it's correctly installed.

Install NodeJS 16 LTS from here: https://nodejs.org/en/

## 2. Cloning the Repo

Prior to cloning the repo, ensure you have registered your SSH key with GitLab (out of the scope of this guide).

Then run:
```
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle-sl/cradle-platform.git 

#This had issues with the requirements.txt (try the link above)
(previously : https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git)
```

## 3. Set up Environment Variables

Create a file named `.env` (extension only file) in the `cradle-platform` directory containing the following:
```
JWT_SECRET_KEY=[A_SECRET_KEY]
DB_USERNAME=[A_DATABASE_USERNAME]
DB_PASSWORD=[A_DATABASE_PASSWORD]
LIMITER_DISABLED=[True to disable or False to enable]
```

For example:

```
JWT_SECRET_KEY=supersecretkey
DB_USERNAME=user
DB_PASSWORD=abcd1234
LIMITER_DISABLED=True
```

Note you may set these to any arbitrary values.

In case connecting with cradle-sms-relay is needed, you should append your emulator's phone number to the `.env` file.

For example, add this line at the end of the lines mentioned above:

```
EMULATOR_PHONE_NUMBER=[PHONE_NUMBER_OF_EMULATOR_RUNNING_CRADLE_MOBILE_APP]
```

Your emulator's phone number will very likely be 5555215554 or 5555215556. The former is assigned to the first emulator that starts. The latter is assigned to the second emulator that starts.

For example, let's say that you start the CRADLE Mobile app's emulator SECOND (this is AFTER you start the emulator for SMS relay), assuming you have no other emulators open before opening the emulator for SMS relay:

```
EMULATOR_PHONE_NUMBER=5555215556
```

Or in full:

```
JWT_SECRET_KEY=supersecretkey
DB_USERNAME=user
DB_PASSWORD=abcd1234
LIMITER_DISABLED=True
EMULATOR_PHONE_NUMBER=5555215556
```

## 4. Spin up the Docker Containers

From your OS's terminal (such as PowerShell in Windows) run:

```
docker compose up
```

All the Docker images will build, then the Docker containers will start. You may add the `-d` option to run the Docker containers in the background, although that makes it more difficult to see log messages from Flask and MySQL.
(If the Docker can not run properly, try to close the MySQL tasks in the task manager and run it again)

Now it's time to run the database migrations. Once the containers have fully started, run the following command in a new terminal window.

```
docker exec cradle_flask flask db upgrade
```

## 5. Seeding Data

Data seeding is handled by the `manage.py` script in the `server` directory. There are 3 data seeding options which give various amounts of data:

* `seed_minimal`: seeds the bare minimum amount of data to get the application running, useful if you want to debug something without having to trudge through unrelated data
* `seed_test_data`: seeds data required to run the unit tests
* `seed`: seeds a generous amount of random data

In order to seed data, run `docker exec cradle_flask python manage.py [SEED_OPTION]` where `[SEED_OPTION]` is one of the options listed above. For example:

```
docker exec cradle_flask python manage.py seed_test_data
```

## 6. Run the NPM Dev Server

NPM is not run inside Docker (due to poor filesystem performance), so you'll need to run the following to start the NPM development server:
(Make sure you have `NPM 7`)

```
cd client
npm install
npm start
```

If there are a lot of vulnerabilities, try to fix by running `npm ci` to install directly from the `package-lock.json`, or you can try fixing the vulnerabilities with a combination of `npm audit fix`, `npm audit fix --legacy-peer-deps`, and `npm audit fix --force`.

## Start Developing!

- Navigate to http://localhost:3000/ to check out the React client running in your browser, communicating to the server hosted at http://localhost:5000/ which is communicating with MySQL!
- You will be able work on the client-side and server-side code, all while being able to enjoy hot-reloading!


---


# Development

## General Tips

- Make sure to check out the API documentation at http://localhost:5000/apidocs

- Once the initial setup is completed, you'll only need to run `docker-compose up` in the `cradle-platform` directory and `npm start` in the client directory to run Cradle.

- If using Docker Desktop, you may also start / restart / stop the containers from within the GUI.

## Code Formatting

In order to pass the pipeline (and for readability) your code must be properly formatted.

### Frontend

Frontend code is formatted using Prettier and must pass ESLint. Run `npm run format` in the `client` directory to format all frontend files and run a lint check.

### Backend

Backend code is formatted using Black. With your Docker containers running, run `docker exec cradle_flask black .` to format all backend files.

## Package Changes

It's always best to avoid adding additional dependencies to the project if possible. Try to use existing packages rather than installing a new one.

### Frontend

- New packages can be installed in the frontend by running `npm install PACKAGE_NAME` in the `client` folder
-  If another team member has installed a new package, you'll need to run `npm install`

### Backend

- New packages can be installed in the backend by running `docker exec cradle_flask pip install PACKAGE_NAME` with your Docker containers running
- If another team member has installed a new package, you'll need to run `docker-compose build` with your Docker containers off

## Database Changes

- If working on the backend, when you make database changes you'll need to create migrations: run `docker exec cradle_flask flask db migrate` to do so

- If database changes have been made (by you or other team members), run `docker exec cradle_flask flask db upgrade` to upgrade your database schema


## Reseeding your Database

If something has gone wrong and you're having issues with your database, you can always wipe it and reseed. To do so, with your Docker containers off:

1. Run `docker container ls -a` and look for a container named `cradle_mysql` or similar
2. Remove the container by running `docker container rm cradle_mysql` (using the container name identified above)
3. Run `docker volume ls` and look for the volume associated with the MySQL database. It's likely named `cradle-platform_mysql_data` or something similar
4. Remove the Docker volume: `docker volume rm 415-cradle-platform_mysql_data` (using the volume name identified above)
5. Start your Docker containers: `docker-compose up`
6. Upgrade your database schema: `docker exec cradle_flask flask db upgrade`
7. Reseed: `docker exec cradle_flask python manage.py seed` (see setup above for more seed options)


## Useful Tools / Dev Software

* [Postman](https://www.getpostman.com/): 
   - Used to test API endpoints and send HTTP requests with a GUI 
   - Check out the [Postman Workspace Setup Guide](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/Postman-Workspace-Setup) for how to set up the Postman Workspaces to begin testing the project REST APIs
* [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) 
  - allows you to observe what components make up the webpage/DOM
  - allows you to observe the live values of props and state in components
* [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - allows you to view and debug how data is being passed to and from Redux

## Troubleshooting

### SMS Relay crashing and not working

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
