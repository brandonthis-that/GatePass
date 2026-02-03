# GatePass - Integrated Gate Access and Asset Management System

A modern, professional PWA built for Africa Nazarene University's campus security management.

## 🚀 Features

### Student/Staff Portal
- **Asset Registration**: Register laptops, phones, and personal devices
- **Vehicle Management**: Register and manage personal vehicles
- **QR Code Generation**: Automatic QR code generation for all registered items
- **Personal Dashboard**: Self-service portal for managing registrations
- **Mobile-First Design**: Responsive interface optimized for smartphones

### Guard-Facing Interface
- **High-Contrast Design**: Optimized for outdoor readability in bright sunlight
- **Asset Verification**: Camera-based QR code scanning with instant validation
- **Vehicle Logging**: Manual license plate entry with automatic registration checking
- **Day Scholar Management**: Real-time digital sign-in/out system
- **Touch-Optimized**: Large buttons and simplified workflows for efficiency
- **Offline Capability**: Works without internet connection using PWA technology

### Administrative Dashboard
- **User Management**: Complete CRUD operations for students, staff, and guards
- **Security Auditing**: Comprehensive logging of all gate activities
- **Advanced Reporting**: Filter and export logs by date, user, or activity type
- **Dashboard Analytics**: Real-time statistics and system overview
- **Role-Based Access**: Secure access control with JWT authentication

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) with custom high-contrast theme
- **PWA**: Service Worker with offline caching and background sync
- **Authentication**: JWT-based secure login system
- **QR Scanning**: HTML5 camera integration with QR code processing
- **Offline Storage**: IndexedDB for local data persistence
- **State Management**: React Context API with custom hooks
- **Routing**: React Router with protected routes

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── auth/                    # Authentication services and context
├── components/shared/       # Reusable UI components
├── pages/                   # Main application pages
│   ├── admin/              # Administrative interface
│   ├── auth/               # Authentication pages
│   ├── guard/              # Guard-facing interface
│   └── student/            # Student/staff portal
├── services/               # API and utility services
├── types/                  # TypeScript type definitions
└── serviceWorker.ts        # PWA service worker
```

## 🎯 Implementation Status

✅ **Completed Features**:
- React TypeScript PWA setup with Material-UI
- Professional high-contrast themes for outdoor use
- Student/Staff portal with asset and vehicle management
- Guard interface with QR scanning and vehicle logging
- Administrative dashboard with user management and logs
- JWT authentication system with role-based access
- Offline storage with IndexedDB
- Service worker for PWA functionality

📋 **Next Steps for Full Implementation**:
- Backend API integration (Django REST Framework)
- QR code generation and validation
- Asset and vehicle registration forms
- Real-time day scholar management
- Advanced reporting and analytics
- Push notifications for security alerts
- Camera integration for QR scanning
- Database synchronization

## 🔒 Security Features

- JWT Authentication with role-based access control
- Professional UI designed for institutional use
- High-contrast themes for outdoor visibility
- Touch-friendly interfaces for guards
- Complete audit trails for all activities

## 📱 PWA Capabilities

- Installable on mobile devices
- Offline-first architecture
- Background sync for data synchronization
- Service worker for caching strategies

---

**Built for Africa Nazarene University Campus Security** 🛡️