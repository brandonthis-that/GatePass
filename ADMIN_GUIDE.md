# Admin Guide - GatePass System

## Admin Access & Functionality

### How Admins Access the System

**Admins do NOT use the React frontend app.** Instead, they access the powerful Django Admin panel directly.

---

## 🔐 Admin Panel Access

### URL
```
http://localhost:8000/admin/
```
**Production:** `https://your-domain.com/admin/`

### Creating Admin Users

#### First Time Setup
```bash
cd /home/goatbrandon/projects/GatePass/backend
source venv/bin/activate
python manage.py createsuperuser
```

You'll be prompted for:
- **Username**: Choose admin username (e.g., `admin`, `gateadmin`)
- **Email**: Optional but recommended
- **Password**: Strong password (minimum 8 characters)

#### Creating Additional Admin Users
1. Login to admin panel as superuser
2. Navigate to **Authentication and Authorization → Users**
3. Click **Add User**
4. Set username and password
5. Click **Save and continue editing**
6. Under **Permissions**, check:
   - ✅ **Staff status** (allows access to admin site)
   - ✅ **Superuser status** (full permissions)
7. Click **Save**

---

## 📊 Admin Dashboard Features

### What Admins Can Do

#### 1. **User Management**
- View all students and guards
- Edit user profiles and permissions
- Activate/deactivate accounts
- Reset passwords
- View user login history

**Navigation:** *Admin Home → Core → Student Profiles*

#### 2. **Asset Management**
- View all registered assets
- Search by serial number, owner, or asset type
- Filter by asset type (Laptop, Tablet, Phone, etc.)
- View/download QR codes
- Manually register assets for students
- Delete unauthorized assets

**Navigation:** *Admin Home → Core → Assets*

**Features:**
- **Search**: Type student name or serial number
- **Filters**: Asset type, registration date
- **Actions**: Export selected, delete selected
- **QR Code**: Click asset to view QR code image

#### 3. **Vehicle Management**
- View all registered vehicles
- Search by plate number or owner
- Edit vehicle details
- View vehicle entry/exit history
- Register vehicles manually

**Navigation:** *Admin Home → Core → Vehicles*

#### 4. **Gate Log Reports** (Most Important!)
- View ALL gate activities in one place
- Filter by:
  - **Log Type**: Vehicle In, Vehicle Out, Asset Verify, Scholar In/Out
  - **Date Range**: Today, Last 7 days, Custom
  - **Guard**: Which guard performed the action
  - **Student**: Specific student activity
- Sort by timestamp (newest first)
- Search by student name or vehicle plate

**Navigation:** *Admin Home → Core → Gate Logs*

**Report Types:**
- `VEHICLE_IN` - Vehicle entered campus
- `VEHICLE_OUT` - Vehicle left campus
- `ASSET_VERIFY` - Asset ownership verified
- `SCHOLAR_IN` - Day scholar signed in
- `SCHOLAR_OUT` - Day scholar signed out

#### 5. **Data Export**
**Admins can export ALL data to Excel, CSV, or JSON!**

**How to Export:**
1. Navigate to any section (Gate Logs, Assets, Vehicles, etc.)
2. Select items to export (or leave blank for all)
3. In **Action** dropdown, choose:
   - Export as CSV
   - Export as Excel
   - Export as JSON
4. Click **Go**
5. File downloads automatically

**Use Cases:**
- Monthly reports for administration
- Audit logs for security
- Data analysis in Excel
- Backup purposes

---

## 🎯 Common Admin Tasks

### Daily Operations

#### Check Today's Activity
1. Go to **Gate Logs**
2. Use filter: **Date = Today**
3. Review all entries/exits
4. Export for daily report

#### Find Specific Student Activity
1. Go to **Gate Logs**
2. Search bar: Type student name
3. View all their gate activities

#### Verify Asset Registration
1. Go to **Assets**
2. Search by serial number or student name
3. Verify QR code exists
4. Check registration date

#### Generate Monthly Report
1. Go to **Gate Logs**
2. Filter by date range (e.g., November 1-30)
3. Select all records
4. Export as Excel
5. Use Excel to create charts/summaries

### User Support

#### Reset Student Password
1. Go to **Users**
2. Search for student username
3. Click username
4. Scroll to **Password** section
5. Click link: "this form"
6. Enter new password twice
7. Click **Save**

#### Add New Guard
1. Go to **Users → Add User**
2. Username: `guard2`
3. Password: Set strong password
4. Click **Save and continue**
5. In **Groups**: Add to "Guards" group (if exists)
6. Check **Staff status** (so they can use guard portal)
7. **DO NOT** check Superuser status
8. Click **Save**

#### Activate/Deactivate Accounts
1. Go to **Users**
2. Find user
3. Uncheck **Active** to disable account
4. Click **Save**

---

## 📱 Admin Workflow Examples

### Scenario 1: Security Audit
**Task:** Generate report of all vehicle entries last week

1. Login to admin panel
2. Navigate to **Gate Logs**
3. Filter:
   - **Log Type**: VEHICLE_IN
   - **Date**: Last 7 days
4. Review entries
5. Export as Excel
6. Share with security team

### Scenario 2: Missing Asset Investigation
**Task:** Student claims laptop not registered

1. Go to **Assets**
2. Search: Student name
3. Check if laptop asset exists
4. If not found:
   - Go to **Add Asset**
   - Fill details manually
   - System generates QR code
   - Print QR for student

### Scenario 3: Day Scholar Status Check
**Task:** Parent asks when student left campus

1. Go to **Gate Logs**
2. Search: Student name
3. Filter: **Log Type** = SCHOLAR_OUT
4. View timestamp of last sign-out
5. Provide information to parent

### Scenario 4: Guard Performance Review
**Task:** Check which guard processed most entries

1. Go to **Gate Logs**
2. Filter by **Guard**: guard1
3. Count entries
4. Repeat for other guards
5. Compare totals

---

## 🔍 Advanced Filters & Search

### Gate Logs Advanced Filtering
```
Filters available:
- Log Type (dropdown)
- Date Range (calendar picker)
- Guard (dropdown of all guards)
- Student (autocomplete search)
```

**Combining Filters:**
- Date: November 1-10 + Log Type: VEHICLE_IN
- Guard: guard1 + Date: Today
- Student: john_doe + all log types

### Search Tips
- **Partial match works**: Search "john" finds "john_doe"
- **Case insensitive**: "JOHN" = "john"
- **Multiple fields**: Search box checks names, plate numbers, serial numbers

---

## 📊 Analytics & Reporting

### Built-in Statistics
The admin panel shows:
- Total count of items (top right of each page)
- Filters show count per category
- Recent entries listed first

### Custom Reports
**Export data to Excel and create:**
- Daily entry/exit charts
- Most active students
- Peak traffic hours
- Asset registration trends
- Guard activity comparison

**Recommended Excel Pivot Tables:**
- Count of logs by Type
- Count of logs by Date
- Count of logs by Guard
- Count of vehicle entries by Hour

---

## 🛡️ Security & Permissions

### Admin Roles

**Superuser** (Full Access)
- All CRUD operations
- User management
- System settings
- Can create other admins

**Staff User** (Limited Access)
- Can view admin panel
- Permissions assigned per section
- Cannot change system settings
- Cannot create superusers

### Best Practices
1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Don't share admin credentials** - create separate accounts
3. **Regular audits** - Review user list monthly
4. **Export backups** - Weekly export of all data
5. **Limit superusers** - Only 2-3 people need full access
6. **Use staff accounts** - For guards who need admin access to specific sections

### Recommended Admin Accounts
```
1. superadmin     - IT administrator (you)
2. security_head  - Security chief (superuser)
3. gate_supervisor - Gate supervisor (staff, limited access)
4. data_analyst   - Reports only (staff, read-only)
```

---

## 🚀 Production Deployment Notes

### Before Going Live
1. **Change Django SECRET_KEY** in settings.py
2. **Set DEBUG = False**
3. **Configure ALLOWED_HOSTS**
4. **Use HTTPS** for admin panel
5. **Enable two-factor authentication** (add django-two-factor-auth)
6. **Set up email notifications** for critical actions
7. **Configure database backups** (automated)

### Monitoring
- Check admin login logs weekly
- Review large data exports
- Monitor failed login attempts
- Regular security audits

---

## 🆘 Troubleshooting

### Can't Login to Admin
**Solution:**
```bash
cd backend
source venv/bin/activate
python manage.py changepassword <username>
```

### Forgot Admin Username
**Solution:**
```bash
python manage.py shell
from django.contrib.auth.models import User
User.objects.filter(is_superuser=True).values_list('username', flat=True)
```

### Need to Delete All Test Data
**Solution:**
```bash
python manage.py shell
from core.models import GateLog, Asset, Vehicle, StudentProfile
GateLog.objects.all().delete()
Asset.objects.all().delete()
Vehicle.objects.all().delete()
```

### Export Button Not Working
**Check:**
1. Is `django-import-export` installed?
2. Run: `pip install django-import-export`
3. Restart server

---

## 📞 Quick Reference

| Task | Location | Action |
|------|----------|--------|
| View today's logs | Gate Logs → Filter: Today | Review |
| Export monthly report | Gate Logs → Date filter → Export | Download |
| Add new guard | Users → Add | Create account |
| Reset password | Users → Select user → Password | Change |
| Check asset QR | Assets → Search → Click asset | View |
| Student activity | Gate Logs → Search student | Filter |
| Vehicle history | Gate Logs → Filter: Vehicle logs | Review |
| User management | Users | Edit |

---

## 🎓 Summary

**Admins are power users who:**
- Access Django Admin at `/admin/` (NOT the React app)
- Have full control over all data
- Generate reports and exports
- Manage users and permissions
- Monitor system activity
- Provide support to students and guards

**Key Advantages:**
- ✅ No coding required
- ✅ All data in one place
- ✅ Powerful search and filters
- ✅ Export to Excel/CSV
- ✅ Audit trail of all activities
- ✅ Secure role-based access

**The React app is for students and guards.** 
**The Admin panel is for you (the administrator).**
