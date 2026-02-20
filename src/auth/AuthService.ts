import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, APIResponse } from '../types';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gatepass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gatepass_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'staff';
  studentId?: string;
  staffId?: string;
  phone?: string;
  department?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<APIResponse<{ user: User; token: string }>>('/auth/login/', credentials);
      const { user, token } = response.data.data;

      localStorage.setItem('gatepass_token', token);
      return { user, token };
    } catch (error: any) {
      // Handle specific error responses
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid email or password');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Login failed');
      }
    }
  }

  static async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<APIResponse<{ user: User; token: string }>>('/auth/register', data);
      const { user, token } = response.data.data;

      localStorage.setItem('gatepass_token', token);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('gatepass_token');
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<APIResponse<User>>('/auth/me/');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('gatepass_token');
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  }

  static async refreshToken(): Promise<string> {
    try {
      const response = await api.post<APIResponse<{ token: string }>>('/auth/refresh');
      const { token } = response.data.data;

      localStorage.setItem('gatepass_token', token);
      return token;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  static getTokenFromStorage(): string | null {
    return localStorage.getItem('gatepass_token');
  }

  static isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getTokenFromStorage();
    return token ? this.isTokenValid(token) : false;
  }

  static getUserFromToken(token: string): Partial<User> | null {
    try {
      return jwtDecode<Partial<User>>(token);
    } catch {
      return null;
    }
  }

  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }
}

export default AuthService;