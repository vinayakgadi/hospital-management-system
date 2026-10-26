# HealthPulse Python REST API Backend

A lightweight, robust Python REST API for the HealthPulse Patient Portal built with Flask, SQLite, and Flask-CORS.

## Features
- **Zero-config SQLite database**: Auto-creates `patients.db` and seeds initial records on startup.
- **RESTful Endpoints**:
  - `GET /patients` - Retrieve all patient records
  - `GET /patients/<id>` - Retrieve a single patient
  - `POST /patients` - Register a new patient
  - `PUT /patients/<id>` - Update existing patient details
  - `DELETE /patients/<id>` - Delete patient record
  - `POST /login` - Authenticate admin & patients
- **CORS Enabled**: Fully compatible with Vite/React frontend on `http://localhost:5173`.

## Quick Start

### 1. Install Dependencies
```bash
py -3.7 -m pip install -r requirements.txt
```

### 2. Run the API Server
```bash
py -3.7 app.py
```
Server runs locally at: `http://localhost:5000`
