# Cradle Dev Environment Setup Issue - macOS Port Conflict & CORS

## 📌 Problem Context (MacOS system only)

While setting up the Cradle development environment locally (from the [Cradle-Platform GitHub repo](https://github.sfu.ca/cradle-project/Cradle-Platform)), two major issues were encountered:

### 1. Backend Not Runnings

* ❌ `localhost:5000` not accessible (`ERR_CONNECTION_REFUSED`)
* 🔒 Swagger UI (`http://localhost:5000/apidocs`) returned **403 Forbidden**
* ❌ Frontend login API request to `http://localhost:5000/api/user/auth` failed

### 2. Frontend CORS Issue

* ❌ React frontend (`localhost:3000`) showed a CORS error:
```
Access to XMLHttpRequest at 'http://localhost:5000/api/user/auth' from origin 'http://localhost:3000' has been blocked by CORS policy.
```

## 📌 Problem Context (Linux/Ubuntu, may happen on other OS's)

### 3. cradle-platform Container Not Running Due To Port 3306 Already Being Used

* ❌ `docker compose up` returns `Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3306 -> 0.0.0.0:0: listen tcp 0.0.0.0:3306: bind: address already in use`

---

## 🔎 Root Causes

### ⚠️ Issue 1: macOS AirPlay Conflict

* macOS Monterey+ uses **port 5000** for **AirPlay Receiver** by default.
* This blocks Docker from successfully binding `localhost:5000`.
* Backend container starts but **does not expose 5000 externally**.

### ⚠️ Issue 2: CORS Misconfiguration

* Flask backend didn’t include proper `Access-Control-Allow-Origin` headers.
* Preflight request (`OPTIONS`) not handled properly.

### ⚠️ Issue 3: MySQL Port Conflict

* MySQL uses Port 3306 by default
* If your machine already has MySQL set up or there is another application which uses that port number, then it will cause a conflict between it and the docker container

---

## ✅ Solutions

### ① Disable AirPlay Receiver (macOS only)

1. Go to **System Settings > General > AirPlay & Handoff**
2. Set **AirPlay Receiver** to **Off**

Then re-run the backend:

```bash
docker-compose down
docker-compose up --build
```

### Issue 3: Temporarily Stop Conflicting Application (Linux Only)

1. In your terminal, enter `sudo lsof -i :3036`, this will return the application currently using port 3306, for example:
```
> sudo lsof -i :3306
COMMAND  PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
mysqld  1716 mysql   21u  IPv6  17926      0t0  TCP *:mysql (LISTEN)
# The port is being used by mysql
```
2. Temporarily stop the conflicting application (i.e, MySQL) to free the port with `sudo systemctl stop <user>`. For example: `sudo systemctl stop mysql`

3. Re-run the backend with `docker compose up`

* Note: this will only temporarily stop the application, if you turn off your machine, then the conflicting application will start again.

* TODO: Find more permanent solution to this problem? (Maybe reallocating port?), add steps for Windows and Mac.
---

## 📥 Docker Commands Summary

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs cradle_flask --tail=100

# Check running containers
docker ps

# Stop all
docker-compose down
```

---

## 🔢 Final Result

After resolving:

* ✅ Backend runs on `localhost:5000`
* ✅ Frontend can successfully send auth requests
* ✅ Swagger UI is accessible at `http://localhost:5000/apidocs`

---

