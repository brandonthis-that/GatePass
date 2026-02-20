export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'guard' | 'admin';
  student_id?: string;
  staff_id?: string;
  phone?: string;
  department?: string;
  photo?: string;  
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields from backend
  full_name?: string;
  identifier?: string;
}

// Legacy interface for backward compatibility
export interface UserLegacy {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'staff' | 'guard' | 'admin';
  studentId?: string;
  staffId?: string;
  phone?: string;
  department?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  user_id: string;
  type: 'laptop' | 'phone' | 'tablet' | 'other';
  serial_number: string;
  model: string;
  brand: string;
  description?: string;
  qr_code: string;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  plate_number: string;
  make: string;
  model: string;
  color: string;
  year?: number;
  qr_code: string;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GateLog {
  id: string;
  type: 'asset_verification' | 'vehicle_entry' | 'vehicle_exit' | 'day_scholar_in' | 'day_scholar_out';
  user_id?: string;
  asset_id?: string;
  vehicle_id?: string;
  guard_id: string;
  status: 'valid' | 'invalid' | 'visitor';
  timestamp: string;
  notes?: string;
  location?: string;
}

export interface QRCodeData {
  type: 'asset' | 'vehicle';
  id: string;
  user_id: string;
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