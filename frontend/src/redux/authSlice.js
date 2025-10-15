import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = createAsyncThunk("auth/login", async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  localStorage.setItem("token", res.data.token);
  return res.data;
});

export const register = createAsyncThunk("auth/register", async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  localStorage.setItem("token", res.data.token);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem("token") || null, status: "idle" },
  reducers: { logout: (state) => { state.user = null; state.token = null; localStorage.removeItem("token"); } },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload.user; state.token = action.payload.token; })
      .addCase(register.fulfilled, (state, action) => { state.user = action.payload.user; state.token = action.payload.token; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
