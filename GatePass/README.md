# GatePass Prototype

Automated Vehicle, Student, and Asset Verification System (prototype).

Overview
- Flask-based prototype demonstrating integration of: ANPR (OpenALPR), QR-based student verification (pyzbar), and asset lookup with logging.

Quick start (linux)

1. Create a virtualenv and install requirements:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Optional: install OpenALPR and Python bindings if you want real ANPR. If not installed, the app provides a "Simulate Plate" input for testing.

3. Run the app:

```bash
export FLASK_APP=app.py
flask run --host=0.0.0.0
```

4. Open the guard dashboard: http://localhost:5000/guard
   Admin pages: http://localhost:5000/admin

Notes
- The app uses SQLite at `data/gatepass.db`.
- QR codes are generated into `static/qrcodes/`.
- If OpenALPR isn't available, use the "Simulate Plate" box on the Guard page to emulate ANPR matches.

Security and scope
- This is a prototype. No authentication beyond a simple password configured in `app.py` (default: "admin").
- No integration with external university systems.

Next steps
- Add real OpenALPR integration if you have system packages available.
- Improve UI and error handling.
