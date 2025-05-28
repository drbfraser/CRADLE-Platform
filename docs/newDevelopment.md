# Developer Onboarding

**Author:** Dingsong Zhou  
**Date:** May 26, 2025  
**Version:** 1.0  

## 1. Prerequisites

Before running the project locally, ensure the following tools are installed on your machine:

| Tool               | Purpose                                          |
|--------------------|--------------------------------------------------|
| **Docker Desktop** | Run backend (Flask), database (MySQL), etc. in containers |
| **Node.js (v18+)** | Required for frontend development with React/Vite |
| **npm (v9+)**       | Node package manager (usually bundled with Node) |
| **Python (v3.9+)** | Used by the Flask backend (if not using Docker)   |
| **MySQL (v8+)**    | Only if running DB outside Docker                 |
| **Postman**        | API testing (optional but helpful)                |
| **Git**            | For cloning the repository                        |
| **VS Code**        | Recommended IDE                                   |

### Installation Notes

- **Docker Setup**
  - Install Docker: [Get Docker](https://docs.docker.com/get-docker/)
  - If using **Windows 10 Home**, enable **WSL 2** before installing Docker.
  - Once installed, follow Docker Desktop's “Getting Started” guide to verify your install.

- **Node.js Setup**
  - Install Node.js (LTS version): [Download from nodejs.org](https://nodejs.org/en/)
  - Confirm installation:
    ```bash
    node -v
    npm -v
    ```


### Optional but Recommended

- **VS Code Extensions**:
  - Prettier – Code formatter
  - ESLint – Linting for JS/TS
  - Python – Linting and debugging

## 2. Development Environment Setup 
### Cloning the Repo

```
git clone https://github.sfu.ca/cradle-project/Cradle-Platform.git
cd Cradle-Platform
```

### Set up Environment Variables

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

### Set up the user pool

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

### Spin up the Docker Containers

From your OS's terminal (such as PowerShell in Windows) run:

```
docker compose up
```
> 💡 If you're using an older version of the Docker CLI, use `docker-compose up` instead (with a hyphen).

All the Docker images will build, then the Docker containers will start. You may add the `-d` option to run the Docker containers in the background, although that makes it more difficult to see log messages from Flask and MySQL.
(If the Docker can not run properly, try to close the MySQL tasks in the task manager and run it again)

If there are issues starting up Docker containers after recent changes to package requirements, refer to the [Package Changes](https://github.sfu.ca/cradle-project/Cradle-Platform/blob/main/docs/development.md#package-changes) section for troubleshooting steps.

Now it's time to run the database migrations. Once the containers have fully started, run the following command in a new terminal window.

```
docker exec cradle_flask flask db upgrade
```

### Seeding Data

Data seeding is handled by the `manage.py` script in the `server` directory. There are 3 data seeding options which give various amounts of data:

- `seed_minimal`: seeds the bare minimum amount of data to get the application running, useful if you want to debug something without having to trudge through unrelated data
- `seed_test_data`: seeds data required to run the unit tests
- `seed`: seeds a generous amount of random data

In order to seed data, run `docker exec cradle_flask python manage.py <SEED_OPTION>` where `<SEED_OPTION>` is one of the options listed above. For example:

```
docker exec cradle_flask python manage.py seed_test_data
```

## 3. Quick Start 

NPM is not run inside Docker (due to poor filesystem performance), so you'll need to run the following to start the NPM development server:

```
cd client
npm install
npm start
```

If installation fails due to out-dated dependencies, try `npm install --legacy-peer-deps`.

If there are a lot of vulnerabilities, try to fix them by running `npm ci` to install directly from the `package-lock.json`. Be careful with `npm audit fix`, as it can introduce more vulnerabilities. Consider committing your changes first, and then attempting a combination of `npm audit fix`, `npm audit fix --legacy-peer-deps`, and `npm audit fix --force`.

If there are errors during `npm start`, try running `npm ci` to install directly from the `package-lock.json`.

### Start Developing!

Once everything is running:

- Backend API: `http://localhost:5000`
- Frontend UI: `http://localhost:3000`
- Swagger API Docs: `http://localhost:5000/apidocs`

Navigate to `http://localhost:3000/` to see the React app in action. It communicates with the Flask backend running at `http://localhost:5000/`, which in turn talks to the MySQL database.

You can now develop on both the frontend and backend **with hot-reloading**, and test full-stack features in real time.

## 4. Project structure
### Backend Project Structure (/server)

  The backend is a Flask + MySQL application using Flask-Restful, JWT, SQLAlchemy, and Pydantic for validation.

 #### Core Structure Overview

```plaintext
server/
├── api/                        # REST API logic
│   ├── resources/              # Resource-level API endpoint handlers
│   ├── decorator.py            # Role-based access control (@roles_required)
│   ├── util.py                 # Common API helpers
│   └── __init__.py             # Partial route duplication (legacy usage)

├── authentication/             # Authentication services
│   ├── CognitoClientWrapper.py # AWS Cognito login integration
│   ├── sms_auth.py             # SMS-based authentication
│   └── __init__.py

├── common/                     # Shared utilities and constants
│   ├── api_utils.py            # Pagination/default API limit helpers
│   ├── commonUtil.py           # General-purpose helpers (e.g. casing)
│   ├── constants.py            # Global constants used across modules
│   ├── date_utils.py           # Date/time formatting helpers
│   ├── form_utils.py           # Helpers for working with forms
│   ├── health_facility_utils.py# Facility-specific logic
│   ├── phone_number_utils.py   # Phone number processing
│   ├── print_utils.py          # Print/debug utilities
│   ├── regexUtil.py            # Regex validation logic
│   └── user_utils.py           # Common user-related logic

├── data/                       # DB abstraction & data transformation
│   ├── crud.py                 # CRUD operations on SQLAlchemy models
│   ├── marshal.py              # Converts dicts <-> ORM objects
│   ├── seed_data/              # Seed data in JSON format
│   └── __init__.py             # Initializes DB session (SQLAlchemy)

├── service/                    # Cross-cutting reusable backend logic
│   ├── FilterHelper.py         # Helpers for filtering query results
│   ├── assoc.py                # Association logic for linking models
│   ├── compressor.py           # Possibly compressing response payloads
│   ├── encryptor.py            # Encryption-related utilities
│   ├── invariant.py            # Enforces state constraints/invariants
│   ├── questionTree.py         # Logic for navigating decision trees
│   ├── serialize.py            # Custom serialization functions
│   ├── statsCalculation.py     # Custom statistical computation logic
│   └── view.py                 # Role-based data filtering for views

├── validation/                 # Pydantic models and request validation
│   ├── patients.py, forms.py   # Resource-specific validators
│   └── base classes            # Shared validation logic and helpers

├── specifications/             # Swagger/OpenAPI YAML files
│   └── *.yml                   # Used to generate `/apidocs`

├── systemtests/                # Integration/system-level test suites
│   ├── api/
│   ├── crud_test/
│   ├── flow/
│   ├── mock/
│   ├── utils/
│   ├── conftest.py
│   └── test_*.py               # Functional test cases

├── tests/                      # Unit test suites for individual modules
│   ├── common/
│   ├── service/
│   ├── validation/
│   ├── __init__.py
│   └── README.md

├── migrations/                 # Alembic migration framework
│   ├── versions/               # Migration scripts
│   ├── alembic.ini             # Alembic config
│   ├── env.py                  # Env hooks for migrations
│   ├── script.py.mako          # Template for migration scripts
│   └── README                  # Notes on migration usage

├── app.py                      # Flask application factory
├── config.py                   # App configuration (JWT, DB, etc.)
├── routes.py                   # Registers API routes from api/resources
├── manage.py                   # CLI utility for DB seeding
├── models.py                   # SQLAlchemy ORM table definitions
├── utils.py                    # Generic helpers (can be moved to service/)
├── Dockerfile                  # Docker container specification
├── requirements.txt            # Project dependencies
├── ruff.toml                   # Linting rules for Ruff
└── __init__.py                 # Package-level init
```

### Frontend Project Structure (/client)

A modern TypeScript frontend using React, Material UI (MUI), Redux for state management, Vite for dev tooling, and Cypress/Playwright for E2E testing.

#### Core Structure Overview
```plaintext
client/
├── cypress/                  # Cypress E2E tests and support files
├── playwright/               # Playwright test definitions and config
├── public/                   # Static assets (e.g., favicon, manifest)
│
├── src/                      # Main application source code
│   ├── app/                  # Root layout, global route config
│   ├── context/providers/    # React context providers (e.g., theme, auth)
│   ├── pages/                # Page-level components for routing
│   ├── redux/                # Redux store + slices
│   ├── shared/               # Shared UI components, constants, hooks
│   ├── testing/              # Test utilities, mocks
│   ├── images.d.ts           # Type declarations for image imports
│   ├── index.css             # Global styles
│   ├── index.tsx             # Application entry point
│   └── vite-env.d.ts         # Vite's global TS declarations
│
├── .gitignore
├── .lintstagedrc.json        # Lint-staged config (pre-commit checks)
├── .prettierignore
├── .prettierrc.json
├── cypress.config.ts         # Cypress configuration
├── eslint.config.js          # ESLint rules
├── index.html                # HTML entry file used by Vite
├── package.json              # Project metadata and dependencies
├── package-lock.json
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite project configuration
```
## 5. Database & Migrations
> All DB commands assume your Docker containers are running.

### Accessing the DB

```bash
# List running containers
docker ps

# Open MySQL shell
docker exec -it cradle_mysql mysql -p cradle
# Password = $DB_PASSWORD from .env
```
Common MySQL queries:

```sql 
SHOW TABLES;
SELECT * FROM <table>;
```

### Resetting & Reseeding (Quick Script)

```bash 
# 1 Stop & remove MySQL container
docker container rm cradle_mysql

# 2 Delete the persistent volume
docker volume prune -f

# 3 Re-apply migrations (recreate schema)
docker exec cradle_flask flask db upgrade

# 4 Seed data (choose one)
docker exec cradle_flask python manage.py seed_minimal
# or seed_test_data / seed
```

### DB Migrations Workflow

```bash 
# Generate migration after editing models.py
docker exec cradle_flask flask db migrate -m "your message"

# Apply it
docker exec cradle_flask flask db upgrade

# View history
docker exec cradle_flask flask db history
```

## 6. Testing 

### Running Automated Tests Locally

The backend has a fully automated testing pipeline that runs on every merge request. This includes:
	•	System tests (systemTests/)
	•	Unit tests (tests/)
You can run these tests locally with the following steps:

```bash 
# Enter the Flask container
docker exec -it cradle_flask bash

# Run system tests
python -m pytest systemTests

# Run unit tests
python -m pytest tests
```
Note: There is also a remote test that checks code formatting using black. This is not run locally by default.

### Code Formatting for Tests
Ensure your code passes formatting checks by running:
```bash 
# Install black (optional if already installed)
py -m pip install black

# Format a specific file (example: users.py)
black users.py
```
To ensure your merge request doesn’t fail due to formatting issues, always run black before submitting.

For more details: 
[Cradle Platform Testing Guide](https://github.sfu.ca/cradle-project/Cradle-Platform/blob/main/docs/testing/testing.md)
## 7. Troubleshooting & Common Issues

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

### Backend Fails on Port 5000 (macOS AirPlay Conflict)

On macOS (Monterey or later), the Flask backend may fail to serve on localhost:5000. This usually happens because macOS reserves port 5000 for AirPlay Receiver, causing Docker to silently bind the port inside the container without exposing it to the host.

Symptoms

* Visiting `http://localhost:5000` returns `ERR_CONNECTION_REFUSED`
* Swagger UI (`/apidocs`) shows `403 Forbidden`
* Frontend login call to `http://localhost:5000/api/user/auth` fails
* `docker ps` shows the Flask container running, but no service responds on port 5000

Solution

Disable AirPlay Receiver on macOS:

1. Go to System Settings > General > AirPlay & Handoff
2. Set AirPlay Receiver to Off

Then restart Docker:
```bash
docker-compose down
docker-compose up --build
```
This frees up port 5000 so the Flask server can bind it normally.

## 8. General Tips

### Quick Start
1.  Start the backend and database  
    ```bash
    docker compose up  
    ```
2.  In a new terminal, start the React frontend  
    ```bash
    cd client
    npm start
    ```
3.  Open the API documentation: **http://localhost:5000/apidocs**.  
4.  Using Docker Desktop? You can start/stop/restart containers via its GUI instead of the CLI.

---

### Code Formatting (required for CI)

#### Frontend 
Frontend code is formatted using **Prettier** and must pass **ESLint**.  
Run the following command from the `client` directory to automatically fix formatting and lint issues:

```bash
npm run format          # runs Prettier and ESLint
```
#### Backend
Backend code is formatted using Ruff.
With your Docker containers running, run the following command to format all backend files:

```bash
docker exec cradle_flask ruff format .
```

### Adding or Updating Packages

#### Frontend

- **Install a package:**
  ```bash
  npm install <package>
  ```
- **Pull in teammates’ new dependencies:**
  ```bash 
  npm install
  # or
  npm install --legacy-peer-deps
  ```
#### Backend 
- **Install a package:**
  ```bash
  docker exec cradle_flask pip install <package>
  ```
- **Rebuild after dependency changes:**
  ```bash 
  docker compose build
  #(Run this with containers stopped)
  ```
### Database Workflow (quick reminders)
- **Create a migration after editing models.py**
  ```bash
  docker exec cradle_flask flask db migrate -m "describe change"
  ```
- **Apply migrations**
  ```bash 
  docker exec cradle_flask flask db upgrade
  ```
  Need a clean slate? — follow the Resetting & Reseeding steps in §5.2.  
### Useful Tools / Dev Software

#### Postman  
Used to test API endpoints and send HTTP requests with a GUI.  
See the Postman Workspace Setup Guide for step-by-step setup:

[Postman Documentation – Workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/)

#### React Developer Tools  
A Chrome/Firefox extension that lets you:
- Inspect which components make up the DOM
- View live `props` and `state` of components

[React Developer Tools – Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

#### Redux DevTools  
A browser extension for debugging Redux state:
- View store updates in real-time
- See which actions are dispatched
- Time-travel through state changes

[Redux DevTools – Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)