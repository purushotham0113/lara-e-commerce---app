import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../store/slices/cartSlice';
import API from '../lib/api';
import { MapPin, Tag, Loader2, CreditCard, DollarSign } from 'lucide-react';

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Address State
  const [address, setAddress] = useState(cart.shippingAddress.address || '');
  const [city, setCity] = useState(cart.shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(cart.shippingAddress.postalCode || '');
  const [country, setCountry] = useState(cart.shippingAddress.country || '');
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');

  // Payment & Order State
  const [payment, setPayment] = useState(cart.paymentMethod || 'Stripe');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code: '...', discountPercentage: 10 }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // 1. Calculate Prices (Frontend Estimation)
  const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountPrice = couponApplied ? (itemsPrice * couponApplied.discountPercentage) / 100 : 0;
  const priceAfterDiscount = itemsPrice - discountPrice;
  const shippingPrice = priceAfterDiscount > 100 ? 0 : 10;
  const taxPrice = 0.10 * priceAfterDiscount; // 10% Tax
  const totalPrice = priceAfterDiscount + shippingPrice + taxPrice;

  // Handle Address Selection from Profile
  useEffect(() => {
    if (useSavedAddress && user?.addresses?.length > 0) {
        // Default to first if not selected
        const addr = user.addresses.find(a => a._id === selectedSavedAddressId) || user.addresses[0];
        if (addr) {
            setAddress(addr.address);
            setCity(addr.city);
            setPostalCode(addr.postalCode);
            setCountry(addr.country);
        }
    }
  }, [useSavedAddress, selectedSavedAddressId, user]);

  const handleApplyCoupon = async () => {
      setCouponLoading(true);
      setCouponError('');
      try {
          const { data } = await API.post('/coupons/validate', { code: couponCode });
          setCouponApplied(data.data);
          setCouponCode('');
      } catch (error) {
          setCouponError(error.response?.data?.message || 'Invalid Coupon');
          setCouponApplied(null);
      } finally {
          setCouponLoading(false);
      }
  };

  const handleRemoveCoupon = () => {
      setCouponApplied(null);
      setCouponCode('');
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    dispatch(savePaymentMethod(payment));

    try {
      const sanitizedOrderItems = cart.cartItems.map(item => ({
        ...item,
        product: typeof item.product === 'object' ? item.product._id : item.product
      }));

      const orderData = {
        orderItems: sanitizedOrderItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: payment,
        itemsPrice, // Backend will recalculate to verify, but we send structural data
        couponCode: couponApplied?.code
      };

      const response = await API.post('/orders', orderData);
      const createdOrder = response.data.data;
      
      dispatch(clearCart());
      navigate(`/orders/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong creating order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.cartItems.length === 0) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
             <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
             <button onClick={() => navigate('/shop')} className="text-gold-600 hover:underline">Return to Shop</button>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-serif font-bold mb-8 text-center">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* STEP 1: SHIPPING */}
          <div className={`bg-white dark:bg-gray-800 p-6 shadow-sm border dark:border-gray-700 rounded-lg transition-colors ${step !== 1 ? 'opacity-60 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2"/> 1. Shipping Address</h2>
            
            {user?.addresses?.length > 0 && (
                <div className="mb-4">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer w-fit mb-2">
                        <input type="checkbox" checked={useSavedAddress} onChange={(e) => setUseSavedAddress(e.target.checked)} className="accent-gold-600"/>
                        <span>Use a saved address</span>
                    </label>
                    {useSavedAddress && (
                        <select 
                            className="w-full border p-2 rounded text-sm bg-gray-50"
                            onChange={(e) => setSelectedSavedAddressId(e.target.value)}
                        >
                            {user.addresses.map(addr => (
                                <option key={addr._id} value={addr._id}>{addr.address}, {addr.city} {addr.isDefault ? '(Default)' : ''}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <input 
                required placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} 
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  required placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} 
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded text-sm"
                />
                 <input 
                  required placeholder="Postal Code" value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} 
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded text-sm"
                />
              </div>
              <input 
                required placeholder="Country" value={country} onChange={(e)=>setCountry(e.target.value)} 
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded text-sm"
              />
              {step === 1 && (
                <button type="submit" className="bg-brand-dark dark:bg-gold-600 text-white px-8 py-2.5 rounded font-bold hover:bg-gold-600 transition-colors">
                    Continue to Payment
                </button>
              )}
            </form>
          </div>

          {/* STEP 2: PAYMENT & REVIEW */}
          <div className={`bg-white dark:bg-gray-800 p-6 shadow-sm border dark:border-gray-700 rounded-lg transition-colors ${step !== 2 ? 'opacity-60 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center"><CreditCard className="w-5 h-5 mr-2"/> 2. Payment & Review</h2>
             <div className="mb-6 space-y-3">
                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${payment === 'Stripe' ? 'border-gold-500 bg-gold-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" value="Stripe" checked={payment === 'Stripe'} onChange={(e)=>setPayment(e.target.value)} className="accent-gold-600 w-4 h-4"/>
                    <span className="font-bold">Credit Card (Stripe)</span>
                  </div>
                  <div className="flex space-x-1">
                      {/* Icons placeholder */}
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </label>
                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${payment === 'COD' ? 'border-gold-500 bg-gold-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" value="COD" checked={payment === 'COD'} onChange={(e)=>setPayment(e.target.value)} className="accent-gold-600 w-4 h-4"/>
                    <span className="font-bold">Cash on Delivery</span>
                  </div>
                  <DollarSign className="w-5 h-5 text-gray-400"/>
                </label>
             </div>
             
             <div className="border-t dark:border-gray-700 pt-4">
               <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-500">Items in Order</h3>
               <div className="space-y-3">
                {cart.cartItems.map(item => (
                    <div key={item.product+item.size} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded mr-3 overflow-hidden">
                            <img src={item.image} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <span>{item.quantity}x {item.title} ({item.size})</span>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
               </div>
             </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="h-fit bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm transition-colors sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-6 border-b pb-4">
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>${itemsPrice.toFixed(2)}</span></div>
             {couponApplied && (
                 <div className="flex justify-between text-sm text-green-600">
                     <span>Discount ({couponApplied.code})</span>
                     <span>-${discountPrice.toFixed(2)}</span>
                 </div>
             )}
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>Shipping</span><span>${shippingPrice.toFixed(2)}</span></div>
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>Est. Tax (10%)</span><span>${taxPrice.toFixed(2)}</span></div>
          </div>
          
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          {/* Coupon Input */}
          <div className="mb-6">
              {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-100 text-green-700 p-2 rounded text-sm">
                      <span className="font-bold flex items-center"><Tag className="w-3 h-3 mr-1"/> {couponApplied.code} Applied!</span>
                      <button onClick={handleRemoveCoupon} className="text-xs underline hover:text-green-900">Remove</button>
                  </div>
              ) : (
                  <div className="flex space-x-2">
                      <input 
                        placeholder="Coupon Code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 border p-2 rounded text-sm outline-none focus:border-gold-500"
                      />
                      <button 
                        onClick={handleApplyCoupon} 
                        disabled={couponLoading || !couponCode}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-bold hover:bg-gray-300 disabled:opacity-50"
                      >
                          {couponLoading ? '...' : 'Apply'}
                      </button>
                  </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>

          {step === 2 ? (
             <button 
              onClick={handlePlaceOrder} 
              disabled={loading}
              className="w-full bg-gold-600 text-white py-3.5 rounded hover:bg-gold-700 font-bold transition-colors shadow-lg flex justify-center items-center"
             >
               {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'PLACE ORDER'}
             </button>
          ) : (
              <p className="text-xs text-center text-gray-400">Complete shipping details to proceed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;