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

---

## 🔎 Root Causes

### ⚠️ Issue 1: macOS AirPlay Conflict

* macOS Monterey+ uses **port 5000** for **AirPlay Receiver** by default.
* This blocks Docker from successfully binding `localhost:5000`.
* Backend container starts but **does not expose 5000 externally**.

### ⚠️ Issue 2: CORS Misconfiguration

* Flask backend didn’t include proper `Access-Control-Allow-Origin` headers.
* Preflight request (`OPTIONS`) not handled properly.

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

