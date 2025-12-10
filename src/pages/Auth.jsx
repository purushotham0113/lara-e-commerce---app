import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, register, verifyOtp, clearError, resetVerification } from '../store/slices/authSlice';
import { ArrowRight, ShoppingBag, Store, User, Loader2, Lock, Mail } from 'lucide-react';

const Auth = ({ isSignup = false }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(isSignup);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isVendor: false
  });
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, verificationNeeded, tempEmail } = useSelector((state) => state.auth);

  // Determine redirect path
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');
  const from = location.state?.from?.pathname || redirect || '/';

  useEffect(() => {
    if (user) {
      if (user.isAdmin || user.isVendor) {
        navigate('/admin');
      } else {
        const target = (from === '/login' || from === '/signup') ? '/' : from;
        navigate(target, { replace: true });
      }
    }
    dispatch(clearError());
  }, [user, navigate, dispatch, from]);

  useEffect(() => {
    setIsRegisterMode(isSignup);
    dispatch(resetVerification());
  }, [isSignup, dispatch]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      dispatch(register(formData));
    } else {
      dispatch(login({ email: formData.email, password: formData.password }));
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6 && tempEmail) {
      dispatch(verifyOtp({ email: tempEmail, otp }));
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    dispatch(clearError());
    dispatch(resetVerification());
    setFormData({ name: '', email: '', password: '', isVendor: false });
  };

  return (
    <div className="min-h-screen flex animate-fade-in bg-white">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop"
          alt="Luxury Perfume"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-between p-16 h-full text-white">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-4">LARA.</h2>
            <p className="text-gold-400 tracking-widest text-sm uppercase">Essence of Elegance</p>
          </div>
          <div>
            <blockquote className="text-xl font-serif italic mb-6">
              "Perfume is the key to our memories."
            </blockquote>
            <p className="text-sm text-gray-300">Join our exclusive community of fragrance enthusiasts.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50">
        <div className="w-full max-w-md space-y-8">

          {verificationNeeded ? (
            // OTP FORM
            <div className="text-center animate-fade-in">
              <div className="mx-auto w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-gold-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Verify Email</h2>
              <p className="text-gray-600 mb-8">We sent a 6-digit code to <strong>{tempEmail}</strong>.<br />Please enter it below.</p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm mb-6 text-left">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 border rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  placeholder="000000"
                />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-gold-600 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'VERIFY ACCOUNT'}
                </button>
              </form>
              <button onClick={() => dispatch(resetVerification())} className="mt-4 text-sm text-gray-500 hover:underline">Back to Registration</button>
            </div>
          ) : (
            // NORMAL AUTH FORM
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-serif font-bold text-gray-900">
                  {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-gray-600">
                  {isRegisterMode
                    ? 'Enter your details to register.'
                    : 'Please enter your details to sign in.'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {isRegisterMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          name="name"
                          type="text"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-gold-500 focus:border-gold-500 transition-colors"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">@</span>
                      </div>
                      <input
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-gold-500 focus:border-gold-500 transition-colors"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        name="password"
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-gold-500 focus:border-gold-500 transition-colors"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {isRegisterMode && (
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        id="isVendor"
                        name="isVendor"
                        type="checkbox"
                        checked={formData.isVendor}
                        onChange={handleChange}
                        className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isVendor" className="text-sm text-gray-700 flex items-center cursor-pointer">
                        <Store className="w-4 h-4 mr-2 text-gray-500" />
                        Register as a Vendor/Seller
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-brand-dark hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all duration-300 font-bold tracking-wide"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      {isRegisterMode ? 'Sign Up' : 'Sign In'}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button
                    onClick={toggleMode}
                    className="font-bold text-gold-600 hover:text-gold-500 transition-colors"
                  >
                    {isRegisterMode ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;