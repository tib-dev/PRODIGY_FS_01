import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import registerReducer from "./registerSlice";

export const createStoreInstance = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      register: registerReducer,
    },
  });
};
