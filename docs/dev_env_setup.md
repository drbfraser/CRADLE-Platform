## What you'll need 

- Linux, macOS or Windows 10 Pro / Education / Enterprise
  - Windows 10 Education is available for free from https://sfu.onthehub.com/WebStore/ProductsByMajorVersionList.aspx
- Docker: https://www.docker.com/products/docker-desktop
  - You will need to run the `docker` and `docker-compose` commands 
- Node + NPM: https://nodejs.org/en/download/

## 1. Cloning the Repo

Clone the repo:
```
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
```

## 2. Set up environment variables
Create a file named `.env` (extension only file) in the the server directory `cradle-platform` with these fields:
```
DB_USERNAME=<A_DATABASE_USERNAME>
DB_PASSWORD=<A_DATABASE_PASSWORD>
```

For example:

```
DB_USERNAME=user
DB_PASSWORD=abcd1234
```

## 3. Spin up the Docker Containers and run the NPM dev server
```
docker-compose up
```

All the Docker images will build and then the Docker containers will start. You may run with the `-d` option to run the Docker containers in the background. NPM is not run inside Docker (due to poor filesystem performance), so in another terminal window (or the same one if you used `-d`) start the NPM dev server:

```
cd client
npm start
```

## Start Developing!
- Navigate to http://localhost:3000/ to check out the React client running in your browser, communicating to the server hosted at http://localhost:5000/ which is communicating with MySQL!
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