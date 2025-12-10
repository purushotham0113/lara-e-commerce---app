import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  cartReducer,
  productReducer,
  orderReducer,
  wishlistReducer
} from './slices'; // Importing from barrel file

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
  },
});