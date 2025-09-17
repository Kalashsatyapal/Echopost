import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const loginUser = createAsyncThunk("auth/loginUser", async (data) => {
  const res = await axios.post(`${API}/login`, data);
  localStorage.setItem("token", res.data.token);
  return res.data;
});

export const registerUser = createAsyncThunk("auth/registerUser", async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem("token") || null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
