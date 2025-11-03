import os
import io
import sqlite3
import threading
import time
import base64
from datetime import datetime
from flask import Flask, g, render_template, request, redirect, url_for, send_from_directory, jsonify, Response
from PIL import Image
import qrcode
from io import BytesIO

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'gatepass.db')
QRCODE_DIR = os.path.join(BASE_DIR, 'static', 'qrcodes')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(QRCODE_DIR, exist_ok=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev'

# Simple in-memory status for last ANPR event
last_anpr_event = {'type': None, 'entity': None, 'outcome': None, 'student': None, 'ts': None}

def get_db_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS Student (
        StudentID TEXT PRIMARY KEY,
        Name TEXT NOT NULL
    );
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS Vehicle (
        LicensePlate TEXT PRIMARY KEY,
        StudentID TEXT,
        FOREIGN KEY(StudentID) REFERENCES Student(StudentID)
    );
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS Asset (
        SerialNumber TEXT PRIMARY KEY,
        Type TEXT,
        StudentID TEXT,
        FOREIGN KEY(StudentID) REFERENCES Student(StudentID)
    );
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS Guard (
        GuardID TEXT PRIMARY KEY,
        Name TEXT NOT NULL
    );
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS Access_Logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT,
        entity TEXT,
        entity_type TEXT,
        outcome TEXT,
        details TEXT,
        guard_id TEXT
    );
    ''')
    conn.commit()
    # Ensure guard_id column exists (for older DBs created without it)
    cur.execute("PRAGMA table_info('Access_Logs')")
    cols = [r[1] for r in cur.fetchall()]
    if 'guard_id' not in cols:
        try:
            cur.execute('ALTER TABLE Access_Logs ADD COLUMN guard_id TEXT')
            conn.commit()
        except Exception:
            pass
    conn.close()

init_db()

def log_event(entity, entity_type, outcome, details='', guard_id=None):
    conn = get_db_conn()
    cur = conn.cursor()
    ts = datetime.utcnow().isoformat()
    try:
        cur.execute('INSERT INTO Access_Logs (ts, entity, entity_type, outcome, details, guard_id) VALUES (?, ?, ?, ?, ?, ?)',
                    (ts, entity, entity_type, outcome, details, guard_id))
    except Exception:
        # Fallback for older schema without guard_id
        cur.execute('INSERT INTO Access_Logs (ts, entity, entity_type, outcome, details) VALUES (?, ?, ?, ?, ?)',
                    (ts, entity, entity_type, outcome, details))
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return redirect(url_for('guard'))

@app.route('/admin')
def admin():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM Student')
    students = cur.fetchall()
    cur.execute('SELECT * FROM Vehicle')
    vehicles = cur.fetchall()
    cur.execute('SELECT * FROM Asset')
    assets = cur.fetchall()
    cur.execute('SELECT * FROM Guard')
    guards = cur.fetchall()
    conn.close()
    return render_template('admin.html', students=students, vehicles=vehicles, assets=assets, guards=guards)

@app.route('/admin/add_student', methods=['POST'])
def add_student():
    sid = request.form.get('student_id')
    name = request.form.get('name')
    if not sid or not name:
        return redirect(url_for('admin'))
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO Student (StudentID, Name) VALUES (?, ?)', (sid, name))
        conn.commit()
    except Exception:
        pass
    conn.close()
    # generate QR code
    img = qrcode.make(sid)
    path = os.path.join(QRCODE_DIR, f"{sid}.png")
    img.save(path)
    return redirect(url_for('admin'))

@app.route('/admin/add_vehicle', methods=['POST'])
def add_vehicle():
    plate = request.form.get('license_plate')
    sid = request.form.get('student_id_for_vehicle')
    if not plate:
        return redirect(url_for('admin'))
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO Vehicle (LicensePlate, StudentID) VALUES (?, ?)', (plate.upper(), sid))
        conn.commit()
    except Exception:
        pass
    conn.close()
    return redirect(url_for('admin'))


@app.route('/admin/add_guard', methods=['POST'])
def add_guard():
    gid = request.form.get('guard_id')
    name = request.form.get('guard_name')
    if not gid or not name:
        return redirect(url_for('admin'))
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO Guard (GuardID, Name) VALUES (?, ?)', (gid, name))
        conn.commit()
    except Exception:
        pass
    conn.close()
    return redirect(url_for('admin'))

@app.route('/admin/add_asset', methods=['POST'])
def add_asset():
    serial = request.form.get('serial')
    type_ = request.form.get('type') or 'Laptop'
    sid = request.form.get('student_id_for_asset')
    if not serial:
        return redirect(url_for('admin'))
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute('INSERT INTO Asset (SerialNumber, Type, StudentID) VALUES (?, ?, ?)', (serial, type_, sid))
        conn.commit()
    except Exception:
        pass
    conn.close()
    # generate QR for asset with ASSET:<serial> payload
    try:
        img = qrcode.make(f"ASSET:{serial}")
        path = os.path.join(QRCODE_DIR, f"asset_{serial}.png")
        img.save(path)
    except Exception:
        pass
    return redirect(url_for('admin'))

@app.route('/logs')
def logs():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM Access_Logs ORDER BY ts DESC')
    entries = cur.fetchall()
    conn.close()
    return render_template('logs.html', entries=entries)

@app.route('/guard')
def guard():
    # In lightweight mode we don't rely on OpenALPR or server-side video.
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM Guard')
    guards = cur.fetchall()
    conn.close()
    return render_template('guard.html', guards=guards)
@app.route('/simulate_plate', methods=['POST'])
def simulate_plate():
    plate = request.form.get('plate')
    guard_id = request.form.get('guard_id')
    if not plate:
        return ('', 204)
    plate = plate.strip().upper()
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT s.StudentID, s.Name FROM Vehicle v JOIN Student s ON v.StudentID = s.StudentID WHERE v.LicensePlate = ?', (plate,))
    row = cur.fetchone()
    conn.close()
    if row:
        log_event(plate, 'vehicle', 'GRANTED', f"Simulated. Student={row['Name']}", guard_id=guard_id)
    else:
        log_event(plate, 'vehicle', 'DENIED', 'Simulated. Not registered', guard_id=guard_id)
    return ('', 204)


@app.route('/qr_lookup', methods=['POST'])
def qr_lookup():
    """Lightweight endpoint: accepts JSON {student_id: '...'} and returns student + assets, logs event."""
    data = request.get_json() or {}
    # Supports payloads: { student_id: 'S123', guard_id: 'G1' }
    sid = data.get('student_id')
    guard_id = data.get('guard_id')
    if not sid:
        return jsonify({'error':'student_id required'}), 400
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM Student WHERE StudentID = ?', (sid,))
    student = cur.fetchone()
    if not student:
        log_event(sid, 'student_qr', 'DENIED', 'Student not found', guard_id=guard_id)
        conn.close()
        return jsonify({'match':False, 'message':'Invalid ID', 'student_id': sid})
    cur.execute('SELECT * FROM Asset WHERE StudentID = ?', (sid,))
    assets = cur.fetchall()
    conn.close()
    log_event(sid, 'student_qr', 'GRANTED', f"Student={student['Name']}", guard_id=guard_id)
    return jsonify({'match':True, 'student':{'id':student['StudentID'],'name':student['Name']}, 'assets':[dict(a) for a in assets]})


@app.route('/asset_lookup', methods=['POST'])
def asset_lookup():
    data = request.get_json() or {}
    serial = data.get('serial')
    guard_id = data.get('guard_id')
    if not serial:
        return jsonify({'error':'serial required'}), 400
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT a.SerialNumber, a.Type, a.StudentID, s.Name as StudentName FROM Asset a LEFT JOIN Student s ON a.StudentID = s.StudentID WHERE a.SerialNumber = ?', (serial,))
    row = cur.fetchone()
    conn.close()
    if not row:
        log_event(serial, 'asset', 'DENIED', 'Asset not found', guard_id=guard_id)
        return jsonify({'match':False, 'message':'Asset not found', 'serial': serial})
    # Found asset
    details = f"AssetType={row['Type']};Owner={row['StudentID'] or ''}:{row['StudentName'] or ''}"
    log_event(serial, 'asset', 'GRANTED', details, guard_id=guard_id)
    return jsonify({'match':True, 'asset':{'serial':row['SerialNumber'],'type':row['Type'],'student_id':row['StudentID'],'student_name':row['StudentName']}})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
