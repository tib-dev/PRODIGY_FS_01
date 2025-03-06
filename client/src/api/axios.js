import axios from "axios";
import { logout, refreshToken } from "../store/authSlice";


export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Allows cookies (for refresh token)
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken; // Get token from Redux store
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry & Refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Return successful response
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { payload } = await store.dispatch(refreshToken()); // Dispatch refresh action
        if (payload?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
          return axiosInstance(originalRequest); // Retry the failed request
        }
      } catch (refreshError) {
        store.dispatch(logout()); // Logout if refresh fails
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
