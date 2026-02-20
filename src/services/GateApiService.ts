/**
 * API service for gate management operations.
 */

import axios from 'axios';
import { Asset, Vehicle, GateLog, QRCodeData } from '../types';

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

// Response interceptor for error handling
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

export class GateApiService {
  // Asset Management
  static async getAssets(params?: {type?: string; search?: string; page?: number}) {
    try {
      const response = await api.get('/assets/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assets');
    }
  }

  static async createAsset(assetData: {
    asset_type: string;
    serial_number: string;
    brand: string;
    model: string;
    description?: string;
  }) {
    try {
      const response = await api.post('/assets/', assetData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create asset');
    }
  }

  static async getAsset(assetId: string) {
    try {
      const response = await api.get(`/assets/${assetId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch asset');
    }
  }

  static async updateAsset(assetId: string, assetData: any) {
    try {
      const response = await api.put(`/assets/${assetId}/`, assetData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update asset');
    }
  }

  static async deleteAsset(assetId: string) {
    try {
      const response = await api.delete(`/assets/${assetId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete asset');
    }
  }

  // Vehicle Management
  static async getVehicles(params?: {type?: string; search?: string; page?: number}) {
    try {
      const response = await api.get('/vehicles/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }

  static async createVehicle(vehicleData: {
    plate_number: string;
    vehicle_type: string;
    make: string;
    model: string;
    color: string;
    year?: number;
  }) {
    try {
      const response = await api.post('/vehicles/', vehicleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create vehicle');
    }
  }

  static async getVehicle(vehicleId: string) {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicle');
    }
  }

  static async updateVehicle(vehicleId: string, vehicleData: any) {
    try {
      const response = await api.put(`/vehicles/${vehicleId}/`, vehicleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vehicle');
    }
  }

  static async deleteVehicle(vehicleId: string) {
    try {
      const response = await api.delete(`/vehicles/${vehicleId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  }

  // QR Code Verification
  static async verifyQRCode(qrData: QRCodeData) {
    try {
      const response = await api.post('/verify-qr/', { qr_data: qrData });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'QR verification failed');
    }
  }

  // Vehicle Entry Logging
  static async logVehicleEntry(data: {
    plate_number: string;
    notes?: string;
    location?: string;
  }) {
    try {
      const response = await api.post('/log-vehicle-entry/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to log vehicle entry');
    }
  }

  // Day Scholar Management
  static async getDayScholars() {
    try {
      const response = await api.get('/day-scholars/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch day scholars');
    }
  }

  static async toggleScholarStatus(userId: string) {
    try {
      const response = await api.post(`/day-scholars/${userId}/toggle/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle scholar status');
    }
  }

  // Gate Logs
  static async getGateLogs(params?: {
    type?: string;
    status?: string;
    guard?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }) {
    try {
      const response = await api.get('/logs/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch gate logs');
    }
  }

  // Dashboard Statistics
  static async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
}

export default GateApiService;