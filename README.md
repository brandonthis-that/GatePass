# 🎓 GatePass System - Django + React

Complete gate management system for ANU built with Django REST Framework and React.

## GatePass - University Gate Management System

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py migrate
python manage.py setup_initial_data  # Creates demo accounts
python manage.py runserver
```
**Backend running at:** http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Frontend running at:** http://localhost:5173

---

## � User Access

### For Students & Guards → React App
**URL:** http://localhost:5173

| Role | Username | Password | Portal |
|------|----------|----------|--------|
| Guard | guard1 | guard123 | Guard Portal |
| Student | john_doe | student123 | Student Portal |
| Student | jane_smith | student123 | Student Portal |
| Student | bob_wilson | student123 | Student Portal (Day Scholar) |

### For Admins → Django Admin Panel
**URL:** http://localhost:8000/admin/

**Create Admin Account:**
```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

**📖 Complete Admin Documentation:** See [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

---

**Admin Panel:** Create with `python manage.py createsuperuser`
Visit: http://localhost:8000/admin/

## Features

✅ **Student Portal** - Register assets & vehicles, get QR codes
✅ **Guard Portal** - Verify assets, log vehicles, manage day scholars  
✅ **Admin Panel** - Full reporting with Excel/CSV export
✅ **JWT Authentication** - Secure token-based auth
✅ **Mobile-Responsive** - Optimized for phones and tablets
✅ **PWA-Ready** - Progressive Web App capabilities

## 📱 Mobile Optimization

The UI is now fully mobile-friendly with:
- Touch-friendly buttons (44px minimum height)
- Responsive grid layouts
- Flexible navigation
- Optimized typography for small screens
- Proper viewport configuration

## Tech Stack

**Backend:** Django 4.2, DRF, SimpleJWT, SQLite
**Frontend:** React 18, Vite, React Router, Axios

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Complete technical documentation
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Admin panel usage guide (READ THIS FOR ADMIN ACCESS!)

---

## 🛡️ Admin Access Explained

**Important:** Admins do NOT use the React frontend app at localhost:5173

**Admins use the Django Admin Panel:**
- URL: http://localhost:8000/admin/
- Full control over all data
- Generate reports and export to Excel/CSV
- Manage users, assets, vehicles, and logs
- Advanced filtering and search

**See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for complete instructions.**
