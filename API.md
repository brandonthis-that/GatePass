# GatePass API Reference

Base URL: `http://localhost:8000`

All protected endpoints require the header:
```
Authorization: Bearer <access_token>
```

Dates and times are returned in ISO 8601 format (UTC).

---

## Authentication

### Obtain Tokens
`POST /api/auth/token/`

No auth required.

**Request**
```json
{
  "username": "jdoe2024",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

---

### Refresh Access Token
`POST /api/auth/token/refresh/`

No auth required.

**Request**
```json
{
  "refresh": "<jwt_refresh_token>"
}
```

**Response `200`**
```json
{
  "access": "<new_jwt_access_token>"
}
```

---

## Users

### Register
`POST /api/users/register/`

No auth required.

**Request**
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
  "is_day_scholar": false
}
```

`role` must be one of: `student`, `guard`, `admin`.  
`student_id` is required for students. `is_day_scholar` defaults to `false`.

**Response `201`**
```json
{
  "id": 1,
  "username": "jdoe2024",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "student_id": "ANU/CS/2024/001",
  "is_day_scholar": false,
  "day_scholar_status": "OFF_CAMPUS"
}
```

---

### Get / Update Own Profile
`GET /api/users/me/`  
`PATCH /api/users/me/`

Auth: any role.

**GET Response `200`**
```json
{
  "id": 1,
  "username": "jdoe2024",
  "first_name": "John",
  "last_name": "Doe",
  "email": "jdoe@anu.ac.ke",
  "role": "student",
  "student_id": "ANU/CS/2024/001",
  "phone": "0712345678",
  "photo": "/media/profile_photos/jdoe.jpg",
  "is_day_scholar": false,
  "day_scholar_status": "OFF_CAMPUS"
}
```

`PATCH` accepts any subset of the above fields. `role` and `student_id` are read-only.

---

## Assets

### List Own Assets
`GET /api/assets/`

Auth: student (returns own assets), guard/admin (returns all).

**Response `200`**
```json
[
  {
    "id": 1,
    "asset_type": "Laptop",
    "serial_number": "SN-ABC123456",
    "model_name": "Dell XPS 15",
    "qr_code": "/media/qr_codes/asset_<uuid>.png",
    "qr_token": "550e8400-e29b-41d4-a716-446655440000",
    "owner_name": "John Doe",
    "owner_photo": "/media/profile_photos/jdoe.jpg",
    "registered_at": "2026-02-21T10:00:00Z"
  }
]
```

---

### Register Asset
`POST /api/assets/`

Auth: student.

**Request**
```json
{
  "asset_type": "Laptop",
  "serial_number": "SN-ABC123456",
  "model_name": "Dell XPS 15"
}
```

`asset_type` examples: `Laptop`, `Tablet`, `Camera`, `Hard Drive`.  
`qr_code` and `qr_token` are generated automatically — do not send them.

**Response `201`** — same shape as list item above.

---

### Verify Asset by QR Token
`GET /api/assets/verify/{token}/`

Auth: guard / admin. Called when a guard scans a student's QR code.

**Response `200`**
```json
{
  "status": "VALID",
  "asset": {
    "id": 1,
    "asset_type": "Laptop",
    "serial_number": "SN-ABC123456",
    "model_name": "Dell XPS 15",
    "qr_code": "/media/qr_codes/asset_<uuid>.png",
    "qr_token": "550e8400-e29b-41d4-a716-446655440000",
    "owner_name": "John Doe",
    "owner_photo": "/media/profile_photos/jdoe.jpg",
    "registered_at": "2026-02-21T10:00:00Z"
  }
}
```

**Response `404`** — token not found
```json
{ "status": "INVALID" }
```

---

### Get / Update / Delete Asset
`GET /api/assets/{id}/`  
`PUT /api/assets/{id}/`  
`PATCH /api/assets/{id}/`  
`DELETE /api/assets/{id}/`

Auth: student (own assets only), guard/admin (any).

---

## Vehicles

### List Vehicles
`GET /api/vehicles/`

Auth: student (own vehicles), guard/admin (all vehicles).

**Response `200`**
```json
[
  {
    "id": 1,
    "plate_number": "KDA 123X",
    "make": "Toyota",
    "model": "Fielder",
    "color": "White",
    "owner_name": "John Doe",
    "owner_student_id": "ANU/CS/2024/001",
    "registered_at": "2026-02-21T10:00:00Z"
  }
]
```

---

### Register Vehicle
`POST /api/vehicles/`

Auth: student.

**Request**
```json
{
  "plate_number": "KDA 123X",
  "make": "Toyota",
  "model": "Fielder",
  "color": "White"
}
```

**Response `201`** — same shape as list item above.

---

### Look Up Vehicle by Plate
`GET /api/vehicles/lookup/?plate=KDA123X`

Auth: guard / admin. Case-insensitive. Use this at the gate when a vehicle arrives.

**Response `200` — registered vehicle**
```json
{
  "status": "REGISTERED",
  "vehicle": {
    "id": 1,
    "plate_number": "KDA 123X",
    "make": "Toyota",
    "model": "Fielder",
    "color": "White",
    "owner_name": "John Doe",
    "owner_student_id": "ANU/CS/2024/001",
    "registered_at": "2026-02-21T10:00:00Z"
  }
}
```

**Response `404` — not in system**
```json
{
  "status": "NOT_FOUND",
  "plate_number": "KDA123X"
}
```

---

### Get / Update / Delete Vehicle
`GET /api/vehicles/{id}/`  
`PUT /api/vehicles/{id}/`  
`PATCH /api/vehicles/{id}/`  
`DELETE /api/vehicles/{id}/`

Auth: student (own vehicles), guard/admin (any).

---

## Visitors

### List Visitors
`GET /api/visitors/`

Auth: guard / admin.

**Response `200`**
```json
[
  {
    "id": 1,
    "name": "Jane Wanjiku",
    "national_id": "12345678",
    "purpose": "Visiting student in Block C",
    "host_name": "John Doe",
    "entry_time": "2026-02-21T10:30:00Z",
    "exit_time": null,
    "guard": 5,
    "guard_name": "Mark Kamau"
  }
]
```

`exit_time` is `null` until the visitor signs out.

---

### Log Visitor Entry
`POST /api/visitors/`

Auth: guard.

**Request**
```json
{
  "name": "Jane Wanjiku",
  "national_id": "12345678",
  "purpose": "Visiting student in Block C",
  "host_name": "John Doe"
}
```

`guard` and `entry_time` are set automatically from the authenticated guard.

**Response `201`** — same shape as list item above.

---

### Sign Out Visitor
`POST /api/visitors/{id}/sign-out/`

Auth: guard / admin. Records the exit time. Returns `400` if already signed out.

**Response `200`** — visitor object with `exit_time` set.

---

## Gate Logs

Gate logs are append-only (no edits or deletes). The `guard` and `timestamp` are always set automatically.

### List Gate Logs
`GET /api/gate-logs/`

Auth: guard (sees own entries), admin (sees all).

**Response `200`**
```json
[
  {
    "id": 1,
    "log_type": "VEHICLE_ENTRY",
    "timestamp": "2026-02-21T10:45:00Z",
    "notes": "Entered via main gate",
    "guard": 5,
    "guard_name": "Mark Kamau",
    "vehicle": 1,
    "asset": null,
    "student": null,
    "plate_number_raw": "",
    "is_visitor": false
  }
]
```

---

### Create Gate Log Entry
`POST /api/gate-logs/`

Auth: guard. Only one of `vehicle`, `asset`, or `student` should be set per entry.

**Log types:**

| `log_type` | Set field | Notes |
|---|---|---|
| `VEHICLE_ENTRY` | `vehicle` (id) | For registered vehicles |
| `VEHICLE_ENTRY` | `plate_number_raw` | For unregistered/visitor vehicles |
| `VEHICLE_EXIT` | `vehicle` or `plate_number_raw` | |
| `ASSET_VERIFY` | `asset` (id) | After QR scan confirms VALID |
| `SCHOLAR_IN` | `student` (id) | Day scholar enters campus |
| `SCHOLAR_OUT` | `student` (id) | Day scholar leaves campus |
| `VISITOR_ENTRY` | — | Set `is_visitor: true` |

**Example — registered vehicle entry:**
```json
{
  "log_type": "VEHICLE_ENTRY",
  "vehicle": 1,
  "notes": "Entered via main gate"
}
```

**Example — unregistered vehicle:**
```json
{
  "log_type": "VEHICLE_ENTRY",
  "plate_number_raw": "KBZ 999Z",
  "notes": "Visitor vehicle, escorted"
}
```

**Example — asset verification:**
```json
{
  "log_type": "ASSET_VERIFY",
  "asset": 3,
  "notes": "Student leaving campus with laptop"
}
```

**Example — visitor entry:**
```json
{
  "log_type": "VISITOR_ENTRY",
  "is_visitor": true,
  "notes": "Visitor logged separately in /api/visitors/"
}
```

**Response `201`** — same shape as list item above.

---

### Activity Reports (Admin)
`GET /api/gate-logs/reports/`

Auth: admin only.

**Response `200`**
```json
{
  "total_events": 142,
  "breakdown": [
    { "log_type": "ASSET_VERIFY", "count": 38 },
    { "log_type": "SCHOLAR_IN",   "count": 30 },
    { "log_type": "SCHOLAR_OUT",  "count": 29 },
    { "log_type": "VEHICLE_ENTRY","count": 25 },
    { "log_type": "VEHICLE_EXIT", "count": 15 },
    { "log_type": "VISITOR_ENTRY","count": 5  }
  ]
}
```

---

## Day Scholars

### List Day Scholars
`GET /api/day-scholars/`

Auth: guard / admin. Returns all users with `is_day_scholar: true`.

**Response `200`** — array of user profile objects (same shape as `/api/users/me/`).

---

### Sign In
`POST /api/day-scholars/{id}/sign-in/`

Auth: guard / admin. Sets `day_scholar_status` to `ON_CAMPUS`.

**Response `200`**
```json
{
  "status": "ON_CAMPUS",
  "student": { ...user profile object... }
}
```

---

### Sign Out
`POST /api/day-scholars/{id}/sign-out/`

Auth: guard / admin. Sets `day_scholar_status` to `OFF_CAMPUS`.

**Response `200`**
```json
{
  "status": "OFF_CAMPUS",
  "student": { ...user profile object... }
}
```

---

## Common Error Responses

| Status | Meaning |
|---|---|
| `400 Bad Request` | Validation error — response body contains field-level errors |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Authenticated but wrong role for this endpoint |
| `404 Not Found` | Resource does not exist |

**Validation error shape:**
```json
{
  "plate_number": ["This field is required."],
  "make": ["This field may not be blank."]
}
```
