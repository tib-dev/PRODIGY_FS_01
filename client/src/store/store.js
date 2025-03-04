import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import register from "./register";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: register,
  },
});
