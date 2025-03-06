import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import registerReducer from "./registerSlice"; // Renamed for consistency

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
  },
});
