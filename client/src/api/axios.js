// api/axios.js
import axios from "axios";
import { getCookie, setCookie } from "../util/cookie"; // Cookie helpers
import { logout } from "../store/authSlice"; // Assuming you have a logout action

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Add your API URL here
  withCredentials: true, // Allows cookies (for refresh token)
});

// Request Interceptor: Attach Access Token from Cookies
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getCookie("accessToken"); // Get token from cookies
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
        // Manually trigger refresh token flow by calling your refresh endpoint
        const refreshToken = getCookie("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh-token", {
            refreshToken,
          });
          const { accessToken } = response.data;

          // Store new accessToken and retry original request
          setCookie("accessToken", accessToken); // Update cookie with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest); // Retry the failed request
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
