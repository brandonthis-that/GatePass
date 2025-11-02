# GatePass Prototype (root)

This workspace contains the GatePass prototype (Flask-based) in the `GatePass/` folder.

Quick start (fast):

```bash
cd GatePass
chmod +x run.sh
./run.sh
```

The `run.sh` script will create a virtualenv, install the minimal Python requirements, and start the app on http://127.0.0.1:5000

Short recommendation on backends for prototypes:

- Keep using Flask for Python-friendly prototyping. It's lightweight and fine for this prototype.
- If you prefer a JavaScript stack, a minimal Node/Express server with the same static templates is equally quick to set up and may be slightly faster to start if you already have Node installed. For purely client-side prototypes (no server logic beyond static files and mocked API), you can serve the `templates` and `static` folders with any static server and keep the QR and simulate features working by adjusting fetch endpoints to local mocks.

See `GatePass/README.md` for more details about the prototype.

# Project
