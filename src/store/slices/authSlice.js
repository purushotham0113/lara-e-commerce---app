import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

// Async Thunks
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const data = response.data.data;
    localStorage.setItem('lara_token', data.token);
    localStorage.setItem('lara_user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Updated Register: Does NOT log in user immediately. Returns { email, requiresVerification: true }
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data.data; // { email, requiresVerification: true }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// New Verify OTP Thunk
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/verify', { email, otp });
    const data = response.data.data; // User data with token
    localStorage.setItem('lara_token', data.token);
    localStorage.setItem('lara_user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.put('/auth/profile', userData);
    const data = response.data.data;

    localStorage.setItem('lara_token', data.token);
    localStorage.setItem('lara_user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const initialState = {
  user: null,
  loading: false,
  error: null,
  success: false,
  verificationNeeded: false, // UI State for OTP Form
  tempEmail: null, // Store email temporarily for OTP Verification
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('lara_token');
      localStorage.removeItem('lara_user');
      state.user = null;
      state.verificationNeeded = false;
      state.tempEmail = null;
    },
    clearError: (state) => {
      state.error = null;
      state.success = false;
    },
    resetVerification: (state) => {
      state.verificationNeeded = false;
      state.tempEmail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.verificationNeeded = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Do not set user here, wait for verification
        if (action.payload.requiresVerification) {
          state.verificationNeeded = true;
          state.tempEmail = action.payload.email;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.verificationNeeded = false;
        state.tempEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.success = false; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, resetVerification } = authSlice.actions;
export default authSlice.reducer;