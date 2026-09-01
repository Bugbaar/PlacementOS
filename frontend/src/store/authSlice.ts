import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
}

const token = localStorage.getItem("placementos_token");

const initialState: AuthState = {
  token,
  email: token ? "tpo@placementos.dev" : null,
  name: token ? "Training & Placement Officer" : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<{ token: string; email: string; name: string }>) {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.name = action.payload.name;
    },
    signedOut() {
      return { token: null, email: null, name: null };
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;
