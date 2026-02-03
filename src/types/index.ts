export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'staff' | 'guard' | 'admin';
  studentId?: string;
  staffId?: string;
  photo?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  type: 'laptop' | 'phone' | 'tablet' | 'other';
  serialNumber: string;
  model: string;
  brand: string;
  description?: string;
  qrCode: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  year?: number;
  qrCode: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GateLog {
  id: string;
  type: 'asset_verification' | 'vehicle_entry' | 'vehicle_exit' | 'day_scholar_in' | 'day_scholar_out';
  userId?: string;
  assetId?: string;
  vehicleId?: string;
  guardId: string;
  status: 'valid' | 'invalid' | 'visitor';
  timestamp: string;
  notes?: string;
  location?: string;
}

export interface QRCodeData {
  type: 'asset' | 'vehicle';
  id: string;
  userId: string;
  timestamp: string;
  hash: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

export interface DashboardStats {
  totalUsers: number;
  totalAssets: number;
  totalVehicles: number;
  todayLogs: number;
  activeGuards: number;
}