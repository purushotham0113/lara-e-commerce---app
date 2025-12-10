import React, { useEffect, useState } from 'react';
import API from '../lib/api';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/orders/myorders');
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-gray-500">You have no orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link to={`/orders/${order._id}`} key={order._id} className="block bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <p className="font-bold text-lg text-brand-dark">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.isPaid ? 'PAID' : 'NOT PAID'}
                    </span>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:space-x-8">
                   <div className="text-right">
                     <span className="block text-sm text-gray-500">Total</span>
                     <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                   </div>
                   <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;