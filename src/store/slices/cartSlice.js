import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // || JSON.parse(localStorage.getItem('lara_cart_items')) || []
  cartItems: [],
  shippingAddress: JSON.parse(localStorage.getItem('lara_shipping_address')) || {},
  paymentMethod: 'Stripe',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Unique item is defined by Product ID AND Variant Size
      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.size === item.size
      );

      if (existItem) {
        // Replace existing item to update quantity
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product && x.size === existItem.size ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      localStorage.setItem('lara_cart_items', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      // Payload must contain { id, size }
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === action.payload.id && x.size === action.payload.size)
      );
      localStorage.setItem('lara_cart_items', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('lara_shipping_address', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('lara_cart_items');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;