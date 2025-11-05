import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Actions
      login: async (username, password) => {
        try {
          const response = await api.post('/auth/login', {
            username,
            password,
          });

          const { data } = response.data;

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

          return data;
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get();

          if (accessToken) {
            await api.post(
              '/auth/logout',
              {},
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          // Remove authorization header
          delete api.defaults.headers.common['Authorization'];
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { data } = response.data;

          set({
            accessToken: data.accessToken,
          });

          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

          return data.accessToken;
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      getMe: async () => {
        try {
          const { accessToken } = get();

          if (!accessToken) {
            throw new Error('No access token available');
          }

          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const { data } = response.data;

          set({
            user: data,
          });

          return data;
        } catch (error) {
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const { accessToken } = get();

          if (!accessToken) {
            throw new Error('No access token available');
          }

          const response = await api.put(
            '/auth/change-password',
            {
              currentPassword,
              newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          return response.data;
        } catch (error) {
          throw error;
        }
      },

      // Initialize auth state (check if token exists and is valid)
      initialize: async () => {
        const { accessToken } = get();

        if (accessToken) {
          try {
            // Set authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Try to get user info
            await get().getMe();
          } catch (error) {
            // If getMe fails, try to refresh token
            try {
              await get().refreshAccessToken();
              await get().getMe();
            } catch (refreshError) {
              // If refresh also fails, logout
              get().logout();
            }
          }
        }
      },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: import.meta.env.DEV, // Enable only in development
    }
  )
);

// Export axios instance for use in other services
export { api };
