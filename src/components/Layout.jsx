import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { ShoppingBag, User, Menu, X, LogOut, Heart, Sun, Moon } from 'lucide-react';

// Helper to generate a consistent color based on string hash
const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserAvatar = ({ name, size = "w-8 h-8", textSize = "text-sm" }) => {
  if (!name) return <User className="w-6 h-6 text-gray-500" />;

  const initial = name.charAt(0).toUpperCase();
  const colorClass = getAvatarColor(name);

  return (
    <div className={`${size} rounded-full ${colorClass} flex items-center justify-center text-white font-bold font-serif shadow-sm ${textSize}`}>
      {initial}
    </div>
  );
};

export const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  console.log("user ", user)
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist?.wishlistItems || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter text-brand-dark dark:text-white">
            LARA<span className="text-gold-600">.</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 font-sans text-sm font-medium text-gray-800 dark:text-gray-200">
            <Link to="/" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">HOME</Link>
            <Link to="/shop" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">SHOP</Link>
            {user && (
              <Link to="/orders" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">MY ORDERS</Link>
            )}
            {user && (user.isAdmin || user.isVendor) && (
              <Link to="/admin" className="text-gold-600 hover:text-gold-700 font-bold">DASHBOARD</Link>
            )}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link to="/wishlist" className="relative group text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative group">
              <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gold-600 transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 border-l pl-4 dark:border-gray-700">
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <UserAvatar name={user.name} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gold-600 dark:group-hover:text-gold-400">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-2" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-200 hover:text-gold-600 transition-colors">
                <User className="w-5 h-5" />
                <span>LOGIN</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 dark:text-white hover:text-gold-600 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fade-in shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-3 text-base font-bold text-gray-800 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
            >
              HOME
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-3 text-base font-bold text-gray-800 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
            >
              SHOP
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-base font-bold text-gray-800 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
              >
                MY ORDERS
              </Link>
            )}
            {user && (user.isAdmin || user.isVendor) && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-base font-bold text-gold-600 hover:text-gold-700 hover:bg-gold-50 dark:hover:bg-gray-800 rounded-md"
              >
                DASHBOARD
              </Link>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              {/* Theme Toggle Mobile */}
              <div className="flex items-center justify-between px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                <span className="font-medium">Theme</span>
                <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-gold-600">
                  {theme === 'dark' ? <div className="flex items-center gap-2"><Sun className="w-5 h-5" /> Light Mode</div> : <div className="flex items-center gap-2"><Moon className="w-5 h-5" /> Dark Mode</div>}
                </button>
              </div>

              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-gray-600 dark:text-gray-300 hover:text-gold-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                <span className="font-medium">Wishlist</span>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  {wishlistItems.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistItems.length}</span>}
                </div>
              </Link>

              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-gray-600 dark:text-gray-300 hover:text-gold-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                <span className="font-medium">Cart</span>
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {cartItems.length > 0 && <span className="bg-gold-500 text-white text-xs px-2 py-0.5 rounded-full">{cartItems.length}</span>}
                </div>
              </Link>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 px-3">
              {user ? (
                <div className="space-y-3">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                    <UserAvatar name={user.name} />
                    <div>
                      <span className="block font-bold text-gray-800 dark:text-white">{user.name}</span>
                      <span className="text-xs text-gray-500">View Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left flex items-center text-red-500 font-bold mt-2 p-2 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-brand-dark dark:bg-white dark:text-black text-white py-3 rounded-lg font-bold shadow-md"
                >
                  <User className="w-5 h-5 mr-2" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer = () => (
  <footer className="bg-brand-dark text-white py-16 dark:bg-black dark:border-t dark:border-gray-800">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-serif font-bold mb-4">LARA.</h2>
      <p className="text-gray-400 text-sm">Defining elegance through scent.</p>
      <div className="mt-8 text-xs text-gray-600">
        &copy; {new Date().getFullYear()} LARA Perfumes. All rights reserved.
      </div>
    </div>
  </footer>
);

export const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Navbar />
    <main className="flex-grow pt-20">{children}</main>
    <Footer />
  </div>
);