import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/comments";

// ✅ Fetch comments for a blog
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (blogId) => {
    const res = await axios.get(`${API_URL}/${blogId}`);
    return { blogId, comments: res.data };
  }
);

// ✅ Add a new comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ blogId, text }, { getState }) => {
    const token = getState().auth.token;
    const res = await axios.post(
      `${API_URL}/${blogId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { blogId, comment: res.data };
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    items: {}, // keyed by blogId
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.items[action.payload.blogId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // add
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comment } = action.payload;
        if (!state.items[blogId]) {
          state.items[blogId] = [];
        }
        state.items[blogId].unshift(comment);
      });
  },
});

export default commentSlice.reducer;
