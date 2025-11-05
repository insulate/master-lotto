import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authStorage = localStorage.getItem('auth-storage');

    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from storage
        const authStorage = localStorage.getItem('auth-storage');

        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          const refreshToken = state?.refreshToken;

          if (refreshToken) {
            // Try to refresh the token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { data } = response.data;
            const newAccessToken = data.accessToken;

            // Update token in localStorage
            const updatedState = {
              ...state,
              accessToken: newAccessToken,
            };

            localStorage.setItem('auth-storage', JSON.stringify({
              state: updatedState,
              version: 0,
            }));

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry original request
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
