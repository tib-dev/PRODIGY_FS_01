import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {axiosInstance} from "../api/axios"; 

// Async thunk for user registration
export const register = createAsyncThunk(
  "register/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/user/register`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default registerSlice.reducer;
