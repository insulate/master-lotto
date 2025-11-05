import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import httpClient from '../lib/httpClient';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: true,

      // Actions
      login: async (username, password) => {
        try {
          const response = await httpClient.post('/auth/login', {
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
            await httpClient.post('/auth/logout');
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
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await httpClient.post('/auth/refresh', {
            refreshToken,
          });

          const { data } = response.data;

          set({
            accessToken: data.accessToken,
          });

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

          const response = await httpClient.get('/auth/me');

          const { data } = response.data;

          set({
            user: data.user,
          });

          return data.user;
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

          const response = await httpClient.put('/auth/change-password', {
            currentPassword,
            newPassword,
          });

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

        // Mark initialization as complete
        set({ isInitializing: false });
      },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          // isInitializing is intentionally not persisted - always starts as true
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: import.meta.env.DEV, // Enable only in development
    }
  )
);
