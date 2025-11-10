import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  register: (data) =>
    api.post('/auth/register/', data),
  getCurrentUser: () =>
    api.get('/auth/me/'),
};

export const studentAPI = {
  getProfile: () =>
    api.get('/profile/'),
  updateProfile: (data) =>
    api.patch('/profile/', data),
  
  // Assets
  getAssets: () =>
    api.get('/assets/'),
  createAsset: (data) =>
    api.post('/assets/', data),
  getAssetQR: (id) =>
    api.get(`/assets/${id}/qr/`, { responseType: 'blob' }),
  
  // Vehicles
  getVehicles: () =>
    api.get('/vehicles/'),
  createVehicle: (data) =>
    api.post('/vehicles/', data),
};

export const guardAPI = {
  verifyAsset: (assetId) =>
    api.post(`/verify-asset/${assetId}/`),
  logVehicle: (data) =>
    api.post('/log-vehicle/', data),
  getDayScholars: () =>
    api.get('/day-scholars/'),
  logScholar: (scholarId, action, notes = '') =>
    api.post(`/log-scholar/${scholarId}/`, { action, notes }),
  getLogs: (params) =>
    api.get('/logs/', { params }),
};

export default api;
