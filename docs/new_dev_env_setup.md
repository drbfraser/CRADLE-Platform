## What you'll need 

- Docker https://www.docker.com/products/docker-desktop
  - You will need to run the `docker` and `docker-compose` commands 

## 1. Cloning the Repo

Clone the repo:
```
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
```

## 2. Set up environment variables
1. Create a file named `.env` (extension only file) in the the server directory `cradle-platform/server` with these fields:
```
DB_USERNAME=<MY_MYSQL_DB_USERNAME>
DB_PASSWORD= MY_MYSQL_DB_PASSWORD>
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=<MY_MYSQL_DB_NAME>
EMAIL_USER=<MY_EMAIL_ADDRESS>
EMAIL_PASSWORD=<MY_EMAIL_PASSWORD>
```
* eg: 
```
DB_USERNAME=root
DB_PASSWORD=123456
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=student@gmail.ca
EMAIL_PASSWORD=p4sSw0rd
```

For more details regarding the environment variables of CRADLE, check out: 

2. Create a symbolic link to the `.env` file in the `server` directory in the root directory of the project
- This is required as `docker-compose.yml` reads from a .env file in the same directory
```
cd cradle-platform # change directory to the root directory of the project
ln -s server/.env .env # create a symlink if server/.env to .env in the current directory
```

## 3. Spin up the docker containers and start the app!
```
docker-compose up
```
- All the docker images will be building, then the docker containers will be started, and there will be output in terminal to communicate what is currently happening in the process

## Start deving!
- Navigate to http://localhost:3000/ to check out the react client running in your browser, communicating to the server hosted at http://localhost:5000/, that is interfacing with a MySQL Server, all running in docker containers!
- You will be able work on the client-side and server-side code, all while being able to enjoy hot-reloading!

<hr>

## Useful tools / dev software

* [Postman](https://www.getpostman.com/): 
   - Used to test API endpoints and send HTTP requests with a GUI 
   - Check out the [Postman Workspace Setup Guide](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/Postman-Workspace-Setup) for how to set up the Postman Workspaces to begin testing the project REST APIs
* [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) 
  - allows you to observe what components make up the webpage/DOM
  - allows you to observe the live values of props and state in components
* [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - allows you to view and debug how data is being passed to and from Redux