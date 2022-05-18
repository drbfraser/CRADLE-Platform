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
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
```

## 3. Set up Environment Variables

Create a file named `.env` (extension only file) in the `cradle-platform` directory containing the following:
```
JWT_SECRET_KEY=[A_SECRET_KEY]
DB_USERNAME=[A_DATABASE_USERNAME]
DB_PASSWORD=[A_DATABASE_PASSWORD]
```

For example:

```
JWT_SECRET_KEY=supersecretkey
DB_USERNAME=user
DB_PASSWORD=abcd1234
```

Note you may set these to any arbitrary values.

## 4. Spin up the Docker Containers

From your OS's terminal (such as PowerShell in Windows) run:

```
docker-compose up
```

All the Docker images will build and then the Docker containers will start. You may add the `-d` option to run the Docker containers in the background, although that makes it more difficult to see log messages from Flask and MySQL.
(If the Docker can not run properly, try close the mysql tasks in the task manager and run it again)

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

```
cd client
npm install
npm start
```

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
4. Remove the Docker volume: `docker volume rm cradle-platform_mysql_data` (using the volume name identified above)
5. Start your Docker containers: `docker-compose up`
6. Upgrade your daabase schema: `docker exec cradle_flask flask db upgrade`
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
