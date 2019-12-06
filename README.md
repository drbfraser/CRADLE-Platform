# <img src="readme-img/logo.png" width=40> Cradle VSA System: React Front-End and Python (Flask) Back-End

![License](https://img.shields.io/github/license/Cradle-VSA/cradle-vsa.github.io)

React front-end web application and Python back-end web server for the Cradle VSA System.

View the React web application here: https://cradle-vsa.github.io/client/build

The back-end is in the directory `server/` and the front-end is in the directory `client/`.

## Software Stack (Front-End)

| Purpose | Technology |
| --- | --- |
| Development Language | HTML, CSS, JavaScript |
| Front-End Development Framework | [React](https://reactjs.org/) |
| Dependency Manager | [Yarn](https://yarnpkg.com/) |
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
git clone https://github.com/Cradle-VSA/cradle-vsa.github.io.git
cd cradle-vsa.github.io/
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
DB_USERNAME=MY_MYSQL_DB_USERNAME
DB_PASSWORD=MY_MYSQL_DB_PASSWORD
```

For example:
```
DB_USERNAME=root
DB_PASSWORD=123456
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

The server will be available on port 5000 (http://127.0.0.1:5000).

### Front-End Web Application (Yarn with React)

Enter the project directory:
```shell
cd client/
```

Install [Yarn](https://yarnpkg.com/).

Install the necessary packages:
```shell
yarn install
```

Start the server locally:
```shell
yarn start
```

The server will be available on port 3000 (http://127.0.0.1:3000).

## Deployment

To build the front-end into deployable files, edit the value `homepage` in `client/package.json` to be the URL where the web application will be hosted, so that the page can resolve the correct URL to its resources.

Build the files:
```shell
yarn build
```

The completed files will be ready for deployment at directory `client/build/`.
