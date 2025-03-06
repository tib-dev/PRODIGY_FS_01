// store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setCookie, getCookie, removeCookie } from "../util/cookie"; // Cookie helpers
import { decodeTokenPayload } from "../util/helper"; // Decode token helper
import { axiosInstance } from "../api/axios";

// Helper to create user object from decoded token
const createUserObject = (data) => {
  const decodedToken = decodeTokenPayload(data.accessToken);
  return {
    ...data,
    user_role: decodedToken.user_role,
    user_first_name: decodedToken.user_first_name,
    username: decodedToken.username,
  };
};

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      // Set accessToken and refreshToken in cookies
      setCookie("accessToken", response.data.accessToken, {
        path: "/",
        secure: true,
        httpOnly: true,
      });
      setCookie("refreshToken", response.data.refreshToken, {
        path: "/",
        secure: true,
        httpOnly: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        return rejectWithValue("No refresh token found");
      }
      const response = await axiosInstance.post("/api/auth/refresh-token", {
        refreshToken,
      });

      // Set new access token in cookies
      setCookie("accessToken", response.data.accessToken, {
        path: "/",
        secure: true,
        httpOnly: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue("Session expired, please login again");
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/api/auth/logout");
      removeCookie("accessToken");
      removeCookie("refreshToken");
      return true;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    role: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.user = createUserObject(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.role = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.role = null;
      });
  },
});

export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;
