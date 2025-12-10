import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

// Admin: List all orders
export const listOrders = createAsyncThunk('orders/list', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/orders');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Vendor: List filtered orders
export const listVendorOrders = createAsyncThunk('orders/listVendor', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/orders/vendor');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deliverOrder = createAsyncThunk('orders/deliver', async (id, { rejectWithValue }) => {
  try {
    const response = await API.put(`/orders/${id}/deliver`);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Vendor: Update specific item status
export const updateItemStatus = createAsyncThunk('orders/updateItem', async ({ orderId, itemId, status }, { rejectWithValue }) => {
  try {

    const response = await API.put(`/orders/${orderId}/item/${itemId}/status`, { status });


    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Customer: Cancel Order
export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const response = await API.put(`/orders/${id}/cancel`);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
    successDeliver: false,
    successUpdate: false,
  },
  reducers: {
    resetDeliver: (state) => { state.successDeliver = false; state.successUpdate = false; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listOrders.pending, (state) => { state.loading = true; })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(listVendorOrders.pending, (state) => { state.loading = true; })
      .addCase(listVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.successDeliver = true;
        // Update local state if needed
      })
      .addCase(updateItemStatus.fulfilled, (state, action) => {
        state.successUpdate = true;

      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.successUpdate = true;
      });
  },
});

export const { resetDeliver } = orderSlice.actions;
export default orderSlice.reducer;