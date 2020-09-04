# <img src="readme-img/logo.png" width=40> Cradle VSA System: React Front-End and Python (Flask) Back-End

[![License](https://img.shields.io/github/license/Cradle-VSA/cradle-vsa.github.io)](https://github.com/Cradle-VSA/cradle-vsa.github.io/blob/master/LICENCE)

React front-end web application and Python back-end web server for the Cradle VSA System, a technological health care system to improve maternal care and reduce preventable maternal deaths in Ugandan villages.

> Issue tracking is managed via JIRA at: https://icradle.atlassian.net

View the React web application here: https://cradle-vsa.github.io/client/build
View the React web application here: https://cradle.eastus.cloudapp.azure.com/


The back-end is in the directory `server/` and the front-end is in the directory `client/`.

![Screenshot](readme-img/screenshot.png)

## Software Stack (Front-End)

| Purpose | Technology |
| --- | --- |
| Development Language | TSX, Material UI, Typescript |
| Front-End Development Framework | [React](https://reactjs.org/) |
| Dependency Manager | [npm](https://www.npmjs.com/get-npm) |
| Deployment | [GitHub Pages](https://pages.github.com/) |

## Software Stack (Back-End)

| Purpose | Technology |
| --- | --- |
| Development Language | [Python 3.7](https://www.python.org/downloads/release/python-370/) |
| Web Framework | [Flask](https://www.fullstackpython.com/flask.html) |
| Database | [MySQL](https://www.mysql.com/) |
| Deployment | Under Construction |

## Setup Instructions

### Codebase

Clone the repository and navigate into the directory:
```shell
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
cd cradle-platform/
```

### Database (MySQL)

Install [MySQL](https://www.mysql.com/).

Configure access to the root account on MySQL so that you can login with the following command:
```
mysql -u root -p YOUR_PASSWORD_HERE
```

For reference, see this [sample guide from DigitalOcean for Debian-based systems](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04).

Once in the prompt, create a new database named `cradle` (case-sensitive):
```
mysql> CREATE DATABASE cradle;
Query OK, 1 row affected (0.00 sec)

mysql> exit
Bye
```

In the `server/` directory, create a file named `.env` containing your local MySQL root username and password in the following format:
```
DB_USERNAME=<MY_MYSQL_DB_USERNAME>
DB_PASSWORD= MY_MYSQL_DB_PASSWORD>
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=<MY_MYSQL_DB_NAME>
EMAIL_USER=<MY_EMAIL_ADDRESS>
EMAIL_PASSWORD=<MY_EMAIL_PASSWORD>
```

For example:
```
DB_USERNAME=root
DB_PASSWORD=123456
DB_HOSTNAME=db
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=student@gmail.ca
EMAIL_PASSWORD=p4sSw0rd
```

Note: If using a local MySQL server, set the DB_HOSTNAME to "localhost"

- Create a symbolic link to the `.env` file in the `server` directory in the root directory of the project
    - This is required as `docker-compose.yml` reads from a .env file in the same directory
```
cd cradle-platform # change directory to the root directory of the project
ln -s server/.env .env # create a symlink if server/.env to .env in the current directory
```

This file will be automatically ignored by Git. Do not manually commit it to the repository.

When the back-end web server is started, it will connect to the database using the credentials in this file.

### Back-End Web Server

#### Python and Flask

Enter the project directory:
```shell
cd server/
```

If Python 3 is not yet installed, then install the relevant packages:
```shell
sudo apt-get install python3 python3-pip
```

Install the PIP dependencies:
```shell
pip3 install -r requirements.txt
```
If there are flask errors try: 
```shell
pip3 install -r requirements.txt --user
```
#### Virtualenv (Optional: Isolated Environment for Python packages)

Install Virtualenv and create an environment named `venv` (or any name you prefer) within your project directory:
```shell
pip3 install virtualenv
virtualenv venv
```

Before installing any other packages from the project, activate the virtual environment to isolate your environment for all following commands:
```shell
source venv/bin/activate
```

If on Windows, run the script directly instead:
```
./venv/Scripts/activate
```

Run all Python and PIP commands here.

To deactivate the isolated virtual environment and return to the original environment, either close the console window or run the following command:
```shell
deactivate
```

#### Flask

Flask is installed by the PIP commands above.

For all following commands, `flask` can be replaced with `python3 -m flask` if the Flask executable is not available.

Migrate the database to the newest version:
```shell
flask db upgrade
```

Start the server with either one of the following commands:
```shell
python3 app.py

flask run
```
**Note:** flask might complain when you have python3 and python 2.7 install. In this case uninstall python 2.7
The server will be available on port 5000 (http://127.0.0.1:5000).

### Front-End Web Application

Enter the project directory:
```shell
cd client/
```

Install [npm](https://www.npmjs.com/get-npm).

Install the necessary packages:
```shell
npm install
```

Start the server locally:
```shell
npm run start
```

The server will be available on port 3000 (http://127.0.0.1:3000).

## Deployment

To build the front-end into deployable files, edit the value `homepage` in `client/package.json` to be the URL where the web application will be hosted, so that the page can resolve the correct URL to its resources.

Build the files:
```shell
npm run build
```

The completed files will be ready for deployment at directory `client/build/`.
