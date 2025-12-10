import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../lib/api';
import { updateProfile, clearError } from '../store/slices/authSlice';
import { Loader2, User, Mail, Lock, MapPin, Save, Plus } from 'lucide-react';

const Profile = () => {
  const { user, loading, error, success } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  
  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', city: '', postalCode: '', country: '', isDefault: false });

  useEffect(() => {
    if (user) {
        setName(user.name);
        setEmail(user.email);
    }
    const fetchData = async () => {
        try {
            const responseOrders = await API.get('/orders/myorders');
            setOrders(responseOrders.data.data);
            
            const responseReturns = await API.get('/returns/my');
            setReturns(responseReturns.data.data);
        } catch (error) {
            console.error(error);
        }
    }
    fetchData();
  }, [user]);

  useEffect(() => {
      if(success) {
          setPassword('');
          setConfirmPassword('');
          setIsAddingAddress(false);
          setNewAddress({ address: '', city: '', postalCode: '', country: '', isDefault: false });
          // Optional: Show toast or alert
          setTimeout(() => dispatch(clearError()), 3000);
      }
  }, [success, dispatch]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    dispatch(updateProfile({ name, email, password }));
  };

  const handleAddAddress = (e) => {
      e.preventDefault();
      dispatch(updateProfile({ address: newAddress }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: EDIT PROFILE */}
        <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-6 shadow-sm rounded-lg border">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gold-500" /> My Profile
                </h2>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded text-sm mb-4">Profile Updated Successfully!</div>}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="text-gray-500 text-xs font-bold uppercase mb-1 block">Name</label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-gold-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-bold uppercase mb-1 block">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-gold-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-bold uppercase mb-1 block">New Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full pl-10 p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-gold-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-bold uppercase mb-1 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                            <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full pl-10 p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-gold-500"/>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-bold hover:bg-gold-600 transition-colors flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save className="w-4 h-4 mr-2"/> Update Profile</>}
                    </button>
                </form>
            </div>
            
            {/* ADDRESS BOOK */}
            <div className="bg-white p-6 shadow-sm rounded-lg border">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-serif font-bold flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-gold-500" /> Address Book
                    </h2>
                    <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="text-xs text-gold-600 font-bold hover:underline">
                        {isAddingAddress ? 'Cancel' : '+ Add New'}
                    </button>
                 </div>

                 {isAddingAddress ? (
                     <form onSubmit={handleAddAddress} className="space-y-3 bg-gray-50 p-4 rounded-lg">
                         <input required placeholder="Address Line" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full p-2 text-sm border rounded" />
                         <div className="grid grid-cols-2 gap-2">
                            <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 text-sm border rounded" />
                            <input required placeholder="Zip Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full p-2 text-sm border rounded" />
                         </div>
                         <input required placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} className="w-full p-2 text-sm border rounded" />
                         <label className="flex items-center text-xs">
                             <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="mr-2"/>
                             Set as default address
                         </label>
                         <button type="submit" className="w-full bg-gold-600 text-white py-2 rounded text-xs font-bold">Save Address</button>
                     </form>
                 ) : (
                     <div className="space-y-3">
                         {user?.addresses?.length === 0 && <p className="text-sm text-gray-400 italic">No addresses saved.</p>}
                         {user?.addresses?.map((addr, idx) => (
                             <div key={idx} className={`p-3 rounded border text-sm ${addr.isDefault ? 'border-gold-400 bg-gold-50' : 'border-gray-200'}`}>
                                 <p className="font-bold">{addr.address}</p>
                                 <p className="text-gray-500">{addr.city}, {addr.postalCode}, {addr.country}</p>
                                 {addr.isDefault && <span className="text-[10px] bg-gold-200 text-gold-800 px-1 rounded">Default</span>}
                             </div>
                         ))}
                     </div>
                 )}
            </div>

            <Link to="/wishlist" className="block text-center bg-gray-100 text-gray-700 py-3 rounded border font-bold hover:bg-gray-200 transition-colors">
                View My Wishlist
            </Link>
        </div>

        {/* RIGHT COLUMN: DATA */}
        <div className="md:col-span-8 space-y-10">
             <div>
                <h2 className="text-2xl font-serif font-bold mb-6">Recent Orders</h2>
                {orders.length === 0 ? <p className="text-gray-500 bg-white p-8 rounded-lg border text-center">No orders found.</p> : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap gap-4 justify-between items-center mb-4 border-b pb-4">
                                    <div>
                                        <p className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                                         <span className={`px-2 py-1 text-xs rounded font-bold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {order.isPaid ? 'PAID' : 'UNPAID'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                     <div className="text-sm text-gray-600">
                                         Status: <span className="font-bold">{order.isDelivered ? 'Delivered' : order.status}</span>
                                     </div>
                                     <Link to={`/orders/${order._id}`} className="text-gold-600 hover:text-gold-700 font-bold text-sm flex items-center">
                                         View Details <span className="ml-1">&rarr;</span>
                                     </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>

             <div>
                <h2 className="text-2xl font-serif font-bold mb-6">Returns & Refunds</h2>
                {returns.length === 0 ? <p className="text-gray-500 bg-white p-6 rounded-lg border text-center">No return requests.</p> : (
                     <div className="space-y-4">
                        {returns.map(ret => (
                            <div key={ret._id} className="bg-white p-4 border rounded shadow-sm flex flex-wrap gap-4 justify-between items-center">
                                <div>
                                    <p className="font-bold">Return for Order #{ret.order?._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">Reason: {ret.reason}</p>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                                        ret.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                        ret.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {ret.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                     </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;