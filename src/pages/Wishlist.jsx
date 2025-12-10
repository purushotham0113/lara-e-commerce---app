import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  if (!user) {
      return (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
              <Link to="/login" className="text-gold-600 hover:underline">Go to Login</Link>
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold mb-8">My Wishlist</h1>

      {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
        wishlistItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500 mb-4">Your wishlist is empty</p>
            <Link to="/shop" className="text-gold-600 hover:text-gold-700 font-bold underline">
                Discover Scents
            </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlistItems.map((item) => (
                    <div key={item._id} className="group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-[3/4] bg-gray-100 relative">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                            />
                            <button 
                                onClick={() => dispatch(removeFromWishlist(item._id))}
                                className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 text-center">
                            <Link to={`/products/${item._id}`} className="block">
                                <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-gold-600">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                                <p className="font-bold text-brand-dark mb-4">${item.variants?.[0]?.price || item.price}</p>
                            </Link>
                            <Link to={`/products/${item._id}`} className="block w-full bg-brand-dark text-white py-2 text-sm font-bold hover:bg-gold-600 transition-colors">
                                VIEW PRODUCT
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )
      )}
    </div>
  );
};

export default Wishlist;