import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import ProductEdit from './pages/ProductEdit';
import AdminUsers from './pages/AdminUsers';

function App() {

  // Initialize Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Check local storage or system preference
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Layout>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth isSignup={true} />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Private Routes (Customers, Vendors, Admins) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin/Vendor Routes (No Customers) */}
        <Route element={<ProtectedRoute allowVendor={true} />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/product/create" element={<ProductEdit />} />
          <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
        </Route>

        {/* Strict Admin Only */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;