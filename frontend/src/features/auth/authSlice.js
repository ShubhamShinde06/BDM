import { createSlice } from "@reduxjs/toolkit";

const stored = (() => { try { const r = localStorage.getItem("bl_auth"); return r ? JSON.parse(r) : null; } catch { return null; } })();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored?.user ?? null,
    accessToken: stored?.accessToken ?? null,
    role: stored?.user?.role ?? null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.role = payload.user?.role ?? null;
      localStorage.setItem("bl_auth", JSON.stringify({ user: payload.user, accessToken: payload.accessToken }));
    },
    logout: (state) => {
      state.user = null; state.accessToken = null; state.role = null;
      localStorage.removeItem("bl_auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (s) => s.auth.user;
export const selectCurrentToken = (s) => s.auth.accessToken;
export const selectCurrentRole = (s) => s.auth.role;
export const selectIsAuthenticated = (s) => !!s.auth.accessToken;
export default authSlice.reducer;
