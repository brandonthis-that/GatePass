# GatePass Backend — Africa Nazarene University

A Django REST Framework API for managing gate access at ANU. It covers student asset and vehicle registration, day scholar sign-in/out tracking, visitor logging, and a full audit trail of gate events.

---

## Architecture Overview

### Apps

| App | Responsibility |
|---|---|
| `users` | Custom user model with role-based access (student, guard, admin). Handles registration, profiles, and day scholar status tracking. |
| `assets` | Students register laptops, tablets, and other electronics. Each asset gets a UUID-backed QR code that guards scan at the gate. |
| `vehicles` | Students register their vehicles by plate number. Guards can look up any plate in real time. |
| `visitors` | Guards log visitor entries and record exit times when visitors leave. |
| `gate_logs` | Immutable audit log of every gate event (vehicle entry/exit, asset verification, scholar sign-in/out, visitor entry). |

### Roles

| Role | What they can do |
|---|---|
| `student` | Register their own assets and vehicles. View their own data. |
| `guard` | Look up assets/vehicles, log visitors, create gate log entries, manage day scholar status. |
| `admin` | Everything guards can do, plus view all data and access activity reports. |

Authentication is handled with **JWT tokens** via `djangorestframework-simplejwt`. Every endpoint (except registration and token obtain) requires a valid bearer token.

---

## API Reference

### Auth

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/token/` | POST | None | Log in — returns `access` and `refresh` tokens |
| `/api/auth/token/refresh/` | POST | None | Exchange refresh token for a new access token |

**Login request:**
```json
{ "username": "john_doe", "password": "secret123" }
```

---

### Users

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/users/register/` | POST | None | Create a new user account |
| `/api/users/me/` | GET, PATCH | Any | View or update own profile |

**Registration request:**
```json
{
  "username": "jdoe2024",
  "password": "secret123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "jdoe@anu.ac.ke",
  "role": "student",
  "student_id": "ANU/CS/2024/001",
  "phone": "0712345678",
  "is_day_scholar": true
}
```

> `role` must be one of `student`, `guard`, or `admin`. Users cannot change their own role after registration.

---

### Assets

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/assets/` | GET | Student | List own registered assets |
| `/api/assets/` | POST | Student | Register a new asset |
| `/api/assets/{id}/` | GET, PUT, DELETE | Student | Manage a specific asset |
| `/api/assets/verify/{token}/` | GET | Guard | Verify an asset by scanning its QR code |

**Register asset:**
```json
{
  "asset_type": "Laptop",
  "serial_number": "SN-ABC123456",
  "model_name": "Dell XPS 15"
}
```
The backend automatically generates a QR code image and `qr_token` UUID on save. Guards scan the QR code which hits `/api/assets/verify/{token}/` and returns the asset details plus owner info.

---

### Vehicles

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/vehicles/` | GET | Student | List own registered vehicles |
| `/api/vehicles/` | POST | Student | Register a vehicle |
| `/api/vehicles/{id}/` | GET, PUT, DELETE | Student | Manage a specific vehicle |
| `/api/vehicles/lookup/?plate=KDA123X` | GET | Guard / Admin | Look up any vehicle by plate number |

**Register vehicle:**
```json
{
  "plate_number": "KDA 123X",
  "make": "Toyota",
  "model": "Fielder",
  "color": "White"
}
```

The plate lookup is case-insensitive. It returns `REGISTERED` with full vehicle and owner details, or `NOT_FOUND` if the plate is unknown.

---

### Visitors

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/visitors/` | GET | Guard / Admin | List all visitor records |
| `/api/visitors/` | POST | Guard | Log a new visitor entry |
| `/api/visitors/{id}/sign-out/` | POST | Guard | Record the visitor's exit time |

**Log visitor entry:**
```json
{
  "name": "Jane Wanjiku",
  "national_id": "12345678",
  "purpose": "Visiting student in Block C",
  "host_name": "John Doe"
}
```

The `guard` and `entry_time` fields are set automatically. `exit_time` is `null` until sign-out is called.

---

### Gate Logs

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/gate-logs/` | GET | Guard / Admin | List gate log entries |
| `/api/gate-logs/` | POST | Guard | Create a gate log entry |
| `/api/gate-logs/{id}/` | GET | Guard / Admin | View a specific log entry |
| `/api/gate-logs/reports/` | GET | Admin | Activity summary by event type |

Gate logs are append-only — no edits or deletes via the API. The `guard` and `timestamp` are set automatically.

**Log types:**

| Value | Meaning |
|---|---|
| `VEHICLE_ENTRY` | Registered or unregistered vehicle enters |
| `VEHICLE_EXIT` | Vehicle exits campus |
| `ASSET_VERIFY` | Guard scanned and verified an asset |
| `SCHOLAR_IN` | Day scholar signed in |
| `SCHOLAR_OUT` | Day scholar signed out |
| `VISITOR_ENTRY` | Visitor logged at gate |

**Create log entry (vehicle entry example):**
```json
{
  "log_type": "VEHICLE_ENTRY",
  "vehicle": 3,
  "notes": "Entered via main gate"
}
```

For unregistered vehicles, omit `vehicle` and provide `plate_number_raw` instead. For visitor events, set `is_visitor: true`.

---

### Day Scholars

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/day-scholars/` | GET | Guard / Admin | List all day scholar students |
| `/api/day-scholars/{id}/sign-in/` | POST | Guard / Admin | Mark student as ON_CAMPUS |
| `/api/day-scholars/{id}/sign-out/` | POST | Guard / Admin | Mark student as OFF_CAMPUS |

Only users with `is_day_scholar: true` appear in this list.

---

## Development Setup

```bash
# 1. Activate virtualenv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
cd gatepass_backend
python manage.py migrate

# 4. Create a superuser (admin account)
python manage.py createsuperuser

# 5. Start the dev server
python manage.py runserver
```

The API will be available at `http://localhost:8000/`. Django admin is at `http://localhost:8000/admin/`.

After any model change:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Configuration Notes

- **Database**: SQLite by default (`db.sqlite3`). Swap for PostgreSQL in production — `psycopg2-binary` is already in requirements.
- **CORS**: Currently allows `http://localhost:5173` (Vite dev server). Update `CORS_ALLOWED_ORIGINS` in `settings.py` for other frontends.
- **Media files**: Uploaded profile photos and QR codes are stored under `media/`. The dev server serves them automatically.
- **Time zone**: Set to `UTC`. Adjust `TIME_ZONE` in `settings.py` if needed (e.g. `Africa/Nairobi`).
- **Secret key**: The current key is for development only. Generate a new one for production and load it from an environment variable.
