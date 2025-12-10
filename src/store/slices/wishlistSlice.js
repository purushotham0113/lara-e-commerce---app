import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/wishlist');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (product, { rejectWithValue }) => {
  try {
    const response = await API.post('/wishlist', { productId: product._id });
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const response = await API.delete(`/wishlist/${productId}`);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload; // API returns full updated list
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload; // API returns full updated list
      });
  },
});

export default wishlistSlice.reducer;