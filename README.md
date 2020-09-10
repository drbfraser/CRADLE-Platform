# <img src="readme-img/logo.png" width=40> Cradle VSA System: React Front-End and Python (Flask) Back-End

[![License](https://img.shields.io/github/license/Cradle-VSA/cradle-vsa.github.io)](https://github.com/Cradle-VSA/cradle-vsa.github.io/blob/master/LICENCE)

React front-end web application and Python back-end web server for the Cradle 
VSA System, a technological health care system to improve maternal care and 
reduce preventable maternal deaths in Ugandan villages.

<img src="readme-img/screenshot.png" width="600px"/>

## Sites and Servers

* Issue tracking is managed via JIRA at: https://icradle.atlassian.net
* Build/Test server is hosted by SFU at: https://cmpt373-lockdown.cs.surrey.sfu.ca
* Production server is hosed on Azure at: https://cradle.eastus.cloudapp.azure.com

## Setup Instructions

> Checkout the [wiki](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/home) 
> for alternative ways to setup your development environment.

### Requirements

Development environments are supported on Windows, macOS, and Linux. If you are
on Windows Home Edition, note that there may be some issues getting Docker to
work correctly. Note that the use of Docker in development environments is
entirely optional, and only really recommended for running the database.

* [npm](https://www.npmjs.com/get-npm)
* [Python](https://www.python.org/) 3.7 or higher
* [MySQL](https://dev.mysql.com/downloads/) (or [docker](https://www.docker.com/products/docker-desktop) see below)

> To run the database inside docker, run the following command:
>
> ```
> docker run --name cradle-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -d mysql:5.7
> ```
>
> Note that you can name the container whatever you would like by changing
> "cradle-db", and set the password by changing "password" to something different.


### Front-End Web Application

Setting up the frontend is simple so we'll cover it first.

Install [npm](https://www.npmjs.com/get-npm).

Install the necessary packages:
```shell
npm install
```

Start the server locally:
```shell
npm run start
```

Build the files:
```shell
npm run build
```

### Install virtualenv (Optional)

`virtualenv` is a tool which allows you to install all of your Python project's
dependencies into an isolated location instead of installing them globally on
your system which could conflict with dependencies used by other projects. We
recommend setting it up for Cradle development but it is not necessary.

`virtualenv` can be installed via `pip`:

```
pip install virtualenv
```

Once installed, navigate to the `server` directory and run:

```
virtualenv venv
```

This creates a `venv` folder within the `server` directory which is used to
store all the projects dependencies.

Now, each time you want to run the server you need to first load the environment
into your terminal session. The command to do this varies depending on your 
shell (some common ones are listed bellow), but the general idea is that there
is a script named `activate` somewhere in `server/venv/` that you run to load
the environment.

For Powershell it's the `.ps1` file, and CMD the `.bat` file, the command for
either is simply:

```
.\venv\Scripts\active
```

For bash:

```
source ./venv/bin/activate
```

For fish:

```
source ./venv/bin/activate.fish
```

If everything worked correctly, you should see a little `(venv)` before your
usual prompt telling you that the virtual environment has been loaded. For 
example, in Powershell:

```
PS C:\U\j\D\f\c\server> .\venv\Scripts\activate
(venv) PS C:\U\j\D\f\c\server>
```

### Install Dependencies

From the `server` directory, with virtualenv (optional) loaded:

```
pip install -r ./requirements.txt
```

> Note that if you're on Windows, the `uwsgi` dependency will fail to install.
> It's not required for development builds so you can simply remove it from
> `requirements.txt` and run the command again. Remember to add it back once
> you've finished though as it is used when building for production.

### Configuration

The server pulls configuration from a file named `.env` in the `server` directory.
Create this file now and put the following into it:

```
DB_USERNAME=root
DB_PASSWORD=password
DB_HOSTNAME=localhost
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=sample_user@gmail.com
EMAIL_PASSWORD=password
```

> If you have a different database user/password, make sure to update the
> corresponding variables here to match.

The `EMAIL_USER` and `EMAIL_PASSWORD` are required by some legacy code an may
not be required in the future, but for now they are.

### Database Setup

#### Creating The Database

Once you have MySQL installed an the MySQL service running, or have Docker
installed and have created a MySQL container using the command mentioned in the
requirements section, it's time to setup the database.

The database itself is simply named `cradle` and needs to be created manually
before the schema can be applied. In a MySQL prompt, create a new database like
so:

> If running your database inside docker, you can get a MySQL prompt like so:
>
> ```
> docker exec -it cradle-db mysql -u root -ppassword
> ```
>
> This is assuming the container is named `cradle-db` and your root password is
> `password`. No `-ppassword` is not a typo, that's just how MySQL handles
> passwords on the command line.

```
mysql> create database cradle;
```

Once that's done you can exit the MySQL prompt.

#### Applying The Schema

The database schema is managed by `flask`, our backend framework. To create all
the required tables, simply run the following from the `server` directory (with
`vertualenv` loaded if you decided to use it):

```
flask db upgrade
```

This command runs though and applies all of our database migrations to the
database that you just created in the previous step. If you're interested you
can hop back into that MySQL prompt and view all the new tables.

#### Seeding Data

Data seeding is handled by the `manage.py` script in the `server` directory.
There are 3 commands to seed data into the database, all of which give you
different amounts of data:

* `python ./manage.py seed_minimal`: seeds the bare minimum amount of data to
get the application running, useful if you want to debug something without 
having to trudge through unrelated data
* `python ./manage.py seed_test_data`: seeds data required to run the unit tests
* `python ./manage.py seed`: seeds a generous amount of random data

### Seed Data Usernames & Passwords

When you `seed_minimal`, only one user is added:

| Username           | Password | Role                   |
|--------------------|----------|------------------------|
| admin123@admin.com | admin123 | ADMIN - Administrator  |

If you choose to seed additional test data using either `seed_test_data` or `seed`,
the previously mentioned admin user is added along with a few additional users:

| Username           | Password | Role                         |
|--------------------|----------|------------------------------|
| admin123@admin.com | admin123 | ADMIN - Administrator        |
| hcw@hcw.com        | hcw123   | HCW   - Healthcare Worker    |
| cho@cho.com        | cho123   | CHO   - Chief Health Officer |
| vht@vht.com        | vht123   | VHT   - Village Health Team  |

### Starting The Server

Finally it's time to start the server! To do so simply run:

```
flask run
```
