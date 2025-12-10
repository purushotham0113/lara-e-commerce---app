import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import API from '../lib/api';
import { Package, CheckCircle, Clock, CreditCard, Loader2, Download, AlertTriangle, ArrowLeft } from 'lucide-react';
import OrderTracking from '../components/OrderTracking';
import { cancelOrder } from '../store/slices/orderSlice';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();


  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoadingPay(true);
      // Simulate Payment via API
      await API.post('/payment', {
        orderId: order._id,
        paymentMethod: order.paymentMethod,
        paymentResult: {
          id: `mock_${Date.now()}`,
          status: 'COMPLETED',
          email_address: order.user.email
        }
      });
      fetchOrder(); // Refresh
      alert('Payment Successful!');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoadingPay(false);
    }
  };

  const handleCancelOrder = () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelLoading(true);
    try {
      dispatch(cancelOrder(id)).unwrap();
      fetchOrder();
      alert("Order cancelled successfully.");
    } catch (err) {
      alert(err || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      // This would ideally open a new window or trigger download via Blob
      const response = await API.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${id}.txt`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download invoice");
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    try {
      await API.post('/returns', { orderId: id, reason: returnReason });
      alert("Return request submitted successfully");
      setShowReturnModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-gold-600" /></div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <Link to="/orders" className="text-gray-500 hover:text-black flex items-center mb-6 text-sm font-bold"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders</Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-2">
            Order #{order._id.slice(-6).toUpperCase()}
            <span className={`text-sm px-2 py-1 rounded font-sans ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>{order.status}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={handleDownloadInvoice} className="flex items-center border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Invoice
          </button>

          {/* Cancel Button logic: Only if processing/pending */}
          {order.status === 'Processing' && !order.isDelivered && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelLoading}
              className="flex items-center bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {/* Return Button logic: Only if Delivered */}
          {order.status === 'Delivered' && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* TRACKING */}
      <div className="mb-10">
        <OrderTracking status={order.status} isPaid={order.isPaid} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 shadow-sm border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 border">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link to={`/products/${item.product}`} className="font-bold text-brand-dark hover:text-gold-600 transition-colors">
                        {item.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">Size: {item.size} | Qty: {item.quantity}</div>
                      <div className="text-xs mt-1 font-medium text-gray-400">Status: {item.status}</div>
                    </div>
                  </div>
                  <div className="font-bold">${(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Modal (Simple Implementation) */}
          {showReturnModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h3 className="text-lg font-bold mb-4">Request Return / Refund</h3>
                <textarea
                  className="w-full border rounded p-3 text-sm mb-4"
                  rows="4"
                  placeholder="Please describe why you want to return this item..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-800">Cancel</button>
                  <button onClick={handleReturnSubmit} disabled={returnLoading || !returnReason} className="bg-brand-dark text-white px-4 py-2 rounded font-bold hover:bg-gold-600">
                    {returnLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 shadow-sm border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 border-b pb-4 mb-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${order.itemsPrice.toFixed(2)}</span></div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discountPrice.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between text-xl font-bold mb-6"><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>

            {!order.isPaid && order.paymentMethod === 'Stripe' && order.status !== 'Cancelled' && (
              <button
                onClick={handlePayment}
                disabled={loadingPay}
                className="w-full bg-gold-600 text-white py-3 rounded-lg font-bold hover:bg-gold-700 transition-colors flex items-center justify-center shadow-lg"
              >
                {loadingPay ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                PAY NOW
              </button>
            )}
          </div>

          <div className="bg-gray-50 p-6 shadow-sm border rounded-lg">
            <div className="mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Shipping To</h3>
              <p className="text-sm font-medium">{order.shippingAddress.address}<br />{order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />{order.shippingAddress.country}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Payment</h3>
              <p className="text-sm font-medium flex items-center">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card (Stripe)'}
                <span className={`ml-2 w-2 h-2 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;