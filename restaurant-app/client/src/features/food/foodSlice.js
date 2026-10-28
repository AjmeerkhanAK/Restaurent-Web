import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchFoods = createAsyncThunk(
  "food/fetchFoods",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/foods", {
        params: filters
      });

      return response.data.foods;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load menu"
      );
    }
  }
);

const foodSlice = createSlice({
  name: "food",

  initialState: {
    items: [],
    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default foodSlice.reducer;