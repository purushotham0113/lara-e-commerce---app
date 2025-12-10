import React from 'react';
import Dashboard from './Dashboard'; // Reuse existing dashboard logic for products
// The prompt requested this file specifically, but since Dashboard handles it well, 
// we will wrap the Dashboard or replicate product specific logic here.
// For consistency, let's allow this page to be a dedicated product view.

const AdminProducts = () => {
    return (
        <Dashboard defaultTab="products" />
    );
};

export default AdminProducts;