## What you'll need 

* Node.JS v10 (includes NPM) [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
* Python (3+) [https://www.python.org/](https://www.python.org/)
* MySQL [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
	* _Note: make sure to get MySQL Community Server_ 
* Pip (comes with python)
* Virtualenv 
* Yarn (optional)

## 1. Cloning the Repo

Clone the repo:
```
git clone https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform.git
```

## 2. Setting up Python 3
Recommended way to setup python:
* ```brew install python3```

Alternative way:
* download and install python from the official website
	* Add the directory containing "python.exe" as a PATH environment variable
	* Add the directory containing "pip.exe" as a PATH environment variable (this should be in /Scripts folder where "python.exe" is located)

You should now have `pip` and `python3` installed. To check:
```
pip --version (or pip3 --version)
python --version (or python3 --version)
```

## 3. Setting up MySQL server

1. Download and install MySQL Community Server (link above) 
	* Remember your password (pls)
	* After installation:
		* MacOS:
			* To check if you have correctly installed MySQL: go to `System Preferences` and check if MySQL is there (near the bottom and make sure it's on) 
			* Add `mysql` to your path variable by editing /etc/paths and adding /usr/local/mysql/bin to /etc/paths
				* Or,  ``` brew install mysql```
		* Ubuntu or Debian-based machine:
			* you can also use this guide by [DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04).
2. Login to MySQL through command line and create a database using its shell. Mine is named `cradle`.
	* ``` CREATE DATABASE cradle; ```
		*  Note: The command below can be used to create database without entering the shell (will be useful when setting up server) ```$ mysql -u USER -pPASSWORD -e "CREATE DATABASE cradle;"```
	  * MySQL cheat sheet: https://devhints.io/mysql

At this point you should have successfully created an empty database with no data or tables. To check if you have done this correctly:
* In your terminal: ```mysql -u root -p ```
* In mysql shell: ```show databases;```  (You should see `cradle` as one of the listed databases)

3. Create a file named `.env` (extension only file) in the the server directory `cradle-platform/server` with these fields:
* eg: 
```
DB_USERNAME=root
DB_PASSWORD=123456
DB_HOSTNAME=localhost
DB_PORT=3306
DB_NAME=cradle
EMAIL_USER=student@gmail.ca
EMAIL_PASSWORD=p4sSw0rd
```
Notes:
- The `EMAIL_USER` should preferably be Gmail.
- See the [Env Variables Doc](https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/Env-Variables-Doc) for more information of how to set up the `.env` file and what each field represents

## 4. Installing and creating Virtual Environment
```
pip3 install virtualenv
```
Check if it installed correctly:
```
virtualenv --version
```
 
 To create a virtual environment:
 1. ```cd cradleplatform/server``` # change directory to the server file
 2. ```virtualenv venv``` # create your python virtual environment
 3. ```source venv/bin/activate```
 * if you're on windows run: ```./venv/Scripts/activate```

Once you see (venv) in your terminal:
1. ```pip install -r requirements.txt``` # install all python modules required for the project

## 5. Running migrations and seeding the database
```
flask db upgrade
```
```
python manage.py seed
```
_Note: if the above doesn't work, drop the database, create a new one, and try again!_

## 6. Running the server:
```
python app.py 
```
You can also run the server with Flask:
```
python -m flask run
```

## 7. Setting up React
1. change directory to ``` cradle-platform/client```
2. ``` npm install``` or ```yarn install```
3. ``` npm start``` or ```yarn start```
Navigate to [http://localhost:3000/](http://localhost:3000/) and the React all should be up and running, serving data from the server

Troubleshooting:
if you get an issue like this when running ```yarn install``` in /client: 
```
error rtcmulticonnection@3.6.9: The engine "node" is incompatible with this module. Expected version "latest". Got "13.6.0"  
error Found incompatible module.
```
try:
```
yarn install --ignore-engines
```
## Useful tools

*   Postman: Used to test API endpoints and send HTTP requests with a GUI - [https://www.getpostman.com/](https://www.getpostman.com/)
*   Some database viewer/explorer - nice GUI to run database queries manually
*   MySQL Workbench: Guide to run SQL queries and view database tables / columns - [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)