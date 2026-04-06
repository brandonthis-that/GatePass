import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the JWT to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized responses and refresh the token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we receive a 401 and we haven't already retried this originalRequest
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // We use a clean axios instance to avoid an infinite loop in the interceptor
                    const resp = await axios.post(`${api.defaults.baseURL}/api/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    if (resp.status === 200) {
                        const newAccess = resp.data.access;
                        localStorage.setItem('access_token', newAccess);
                        // Default header for all future requests
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
                        // Retry the original request with new token
                        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                    // If refresh fails, clear tokens and let the user re-login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login'; // Or handle via React Router logic
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
