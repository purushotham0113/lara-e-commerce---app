import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/products');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/products/featured');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const response = await API.post('/products', productData);

    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async (product, { rejectWithValue }) => {
  try {
    const response = await API.put(`/products/${product._id}`, product);

    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createProductReview = createAsyncThunk('products/review', async ({ productId, review }, { rejectWithValue }) => {
  try {
    await API.post(`/products/${productId}/reviews`, review);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featuredProducts: [],
    product: { reviews: [] },
    loading: false,
    error: null,
    // Separate states for review to avoid unmounting product details on review error
    reviewLoading: false,
    reviewError: null,
    successCreate: false,
    successUpdate: false,
    createdProduct: null,
  },
  reducers: {
    resetProductState: (state) => {
      state.successCreate = false;
      state.successUpdate = false;
      state.error = null;
      state.reviewError = null;
      state.product = { reviews: [] };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => { state.loading = true; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successCreate = true;
        state.createdProduct = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => { state.loading = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successUpdate = true;
        state.product = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );

        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      // Review Handling
      .addCase(createProductReview.pending, (state) => {
        state.reviewLoading = true;
        state.reviewError = null;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewLoading = false;
        state.successUpdate = true; // Trigger re-fetch
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.reviewError = action.payload;
      });
  },
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;