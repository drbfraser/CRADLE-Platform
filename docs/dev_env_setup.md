# Development Environment Setup

## 1. Install Required Programs

You'll need to install the following:

- Linux, macOS or Windows 10 Pro / Education / Enterprise
  - Windows 10 Education is available for free for SFU students from https://sfu.onthehub.com/WebStore/ProductsByMajorVersionList.aspx
- Docker: https://www.docker.com/products/docker-desktop
  - You will need to run the `docker` and `docker-compose` commands 
- Node + NPM: https://nodejs.org/en/download/

In particular, if you're on Windows / macOS, follow Docker Desktop's "Getting Started" guide. It'll introduce you to the basics of Docker and give you an easy way to verify it's correctly installed.

## 2. Cloning the Repo

Prior to cloning the repo, ensure you have registered your SSH key with Gitlab (out of the scope of this guide).

Then run:
```
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
```

## 3. Set up Environment Variables

Create a file named `.env` (extension only file) in the `cradle-platform` directory containing the following:
```
DB_USERNAME=[A_DATABASE_USERNAME]
DB_PASSWORD=[A_DATABASE_PASSWORD]
JWT_SECRET_KEY=[A_SECRET_KEY]
```

For example:

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
JWT_SECRET_KEY=supersecretkey
```

## 4. Spin up the Docker Containers

```
docker-compose up
```

All the Docker images will build and then the Docker containers will start. You may use the `-d` option to run the Docker containers in the background.

Now it's time to run the database migrations. Once the containers have fully started, run:

```
docker exec flask flask db upgrade
```

## 5. Seeding Data

Data seeding is handled by the `manage.py` script in the `server` directory. There are 3 data seeding options which give various amounts of data:

* `seed_minimal`: seeds the bare minimum amount of data to get the application running, useful if you want to debug something without having to trudge through unrelated data
* `seed_test_data`: seeds data required to run the unit tests
* `seed`: seeds a generous amount of random data

In order to seed data, run `docker exec flask python manage.py [SEED_OPTION]` where `[SEED_OPTION]` is one of the options listed above. For example:

```
docker exec flask python manage.py seed_test_data
```

## 6. Run the NPM Dev Server

NPM is not run inside Docker (due to poor filesystem performance), so you'll need to run the following to start the NPM development server:

```
cd client
npm start
```

## Start Developing!
- Navigate to http://localhost:3000/ to check out the React client running in your browser, communicating to the server hosted at http://localhost:5000/ which is communicating with MySQL!
- You will be able work on the client-side and server-side code, all while being able to enjoy hot-reloading!
- Once the initial setup is completed, you'll only need to run `docker-compose up` in the `cradle-platform` directory and `npm start` in the client directory to start Cradle.
- If using Docker Desktop, you may also start / restart / stop the containers from within the GUI.

<hr>

## Useful Tools / Dev Software

* [Postman](https://www.getpostman.com/): 
   - Used to test API endpoints and send HTTP requests with a GUI 
   - Check out the [Postman Workspace Setup Guide](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/Postman-Workspace-Setup) for how to set up the Postman Workspaces to begin testing the project REST APIs
* [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) 
  - allows you to observe what components make up the webpage/DOM
  - allows you to observe the live values of props and state in components
* [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - allows you to view and debug how data is being passed to and from Redux