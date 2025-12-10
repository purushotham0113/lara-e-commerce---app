import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { fetchProductDetails, createProductReview, resetProductState } from '../store/slices/productSlice';
import { Star, Truck, ShieldCheck, Heart, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selectors
  const { product, loading, error, successUpdate, reviewLoading, reviewError } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Local State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeImage, setActiveImage] = useState('');

  // 1. Initial Fetch
  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  // 2. Handle Success (e.g., Review Submitted)
  useEffect(() => {
    if (successUpdate) {
        setRating(5);
        setComment('');
        dispatch(resetProductState()); // Reset flags
        dispatch(fetchProductDetails(id)); // Refetch fresh data
    }
  }, [successUpdate, dispatch, id]);

  // 3. Set Defaults when product data arrives
  useEffect(() => {
     if(product && product._id === id) {
        if(product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
        setActiveImage(product.image);
     }
  }, [product, id]);

  const handleAddToCart = (redirect = true) => {
    if (!product || !selectedVariant) return;
    dispatch(addToCart({
      product: product._id,
      title: product.title,
      price: selectedVariant.price,
      size: selectedVariant.size,
      image: product.image,
      quantity: Number(qty),
      countInStock: selectedVariant.stock
    }));
    if (redirect) {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
      handleAddToCart(false); // Add to cart silently
      navigate('/checkout'); // Go straight to checkout
  };

  const isInWishlist = wishlistItems.some(item => item._id === product?._id || item === product?._id);

  const handleWishlistToggle = () => {
    if (!user) {
        navigate('/login?redirect=/products/' + id);
        return;
    }
    if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
    } else {
        dispatch(addToWishlist(product));
    }
  };

  const submitReviewHandler = (e) => {
      e.preventDefault();
      if (!rating || !comment) return;
      dispatch(createProductReview({
          productId: id,
          review: { rating, comment }
      }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gold-600"/></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!product || !product.title) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const allImages = product.image ? [product.image, ...(product.images || [])] : [];
  const galleryImages = [...new Set(allImages)];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative rounded-lg group border border-gray-100">
            <img 
              src={activeImage || product.image} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
             <button 
                onClick={handleWishlistToggle} 
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 z-10 ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
             >
               <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
             </button>
          </div>
          
          {galleryImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-2 hide-scrollbar">
              {galleryImages.map((img, index) => (
                <button 
                  key={index} 
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-24 border-2 rounded-lg overflow-hidden transition-all ${activeImage === img ? 'border-gold-500 ring-2 ring-gold-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <span className="text-gold-600 font-bold text-sm tracking-widest uppercase">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-4 text-brand-dark">{product.title}</h1>
            
            <div className="flex items-center space-x-4">
                <div className="flex text-gold-500 items-center bg-gold-50 px-2 py-1 rounded">
                  <span className="font-bold mr-2 text-gold-700">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500 border-l pl-4">{product.numReviews} Reviews</span>
            </div>
            
            <p className="text-3xl font-bold mt-6 text-brand-dark">
              ${selectedVariant ? selectedVariant.price : (product.price || 0)}
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
            {/* Variants */}
            {product.variants && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Size</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${selectedVariant && selectedVariant.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selectedVariant && selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                        <button
                        key={variant._id || variant.size}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-6 py-3 border rounded-lg text-sm font-bold transition-all ${
                            selectedVariant === variant
                            ? 'border-brand-dark bg-brand-dark text-white shadow-md'
                            : 'border-gray-200 text-gray-600 hover:border-gold-500 bg-white'
                        }`}
                        >
                        {variant.size}
                        </button>
                    ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            {selectedVariant && selectedVariant.stock > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Quantity</h3>
                    <div className="flex items-center space-x-4">
                        <select 
                        value={qty} 
                        onChange={(e) => setQty(e.target.value)}
                        className="border border-gray-300 rounded-lg p-3 w-24 font-bold bg-white focus:ring-gold-500 focus:border-gold-500"
                        >
                        {[...Array(Math.min(10, selectedVariant.stock)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                        </select>
                        <span className="text-sm text-gray-500">{selectedVariant.stock} items left</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button 
                onClick={() => handleAddToCart(true)}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 bg-white border-2 border-brand-dark text-brand-dark font-bold py-4 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                <ShoppingBag className="w-5 h-5"/>
                ADD TO CART
                </button>

                <button 
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 bg-gold-600 text-white font-bold py-4 rounded-lg hover:bg-gold-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                >
                <CreditCard className="w-5 h-5"/>
                {selectedVariant && selectedVariant.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                </button>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="w-5 h-5 text-brand-dark" />
              <span>Free Shipping over $100</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-brand-dark" />
              <span>Authenticity Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
             <h2 className="text-3xl font-serif font-bold">Reviews</h2>
             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">{product.numReviews}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Review List */}
             <div className="lg:col-span-2 space-y-6">
                 {product.reviews && product.reviews.length === 0 && (
                    <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                        <p>No reviews yet. Be the first to review this fragrance.</p>
                    </div>
                 )}
                 {product.reviews && product.reviews.map(review => (
                     <div key={review._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                         <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold font-serif">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <strong className="text-sm block">{review.name}</strong>
                                    <span className="text-xs text-gray-400">{review.createdAt?.substring(0,10)}</span>
                                </div>
                             </div>
                             <div className="flex text-gold-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                             </div>
                         </div>
                         <p className="text-gray-600 text-sm leading-relaxed pl-14">"{review.comment}"</p>
                     </div>
                 ))}
             </div>

             {/* Review Form */}
             <div className="lg:col-span-1">
                 <div className="bg-white p-8 rounded-xl border shadow-sm sticky top-24">
                    <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                    {reviewError && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">{reviewError}</div>}
                    
                    {user ? (
                        <form onSubmit={submitReviewHandler} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-gold-500 focus:border-gold-500">
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                <textarea 
                                    value={comment} 
                                    onChange={(e) => setComment(e.target.value)} 
                                    rows="4" 
                                    className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-gold-500 focus:border-gold-500" 
                                    placeholder="Share your thoughts about this scent..."
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={reviewLoading}
                                className="w-full bg-brand-dark text-white px-6 py-3 rounded-lg hover:bg-gold-600 transition-all font-bold disabled:opacity-50 flex justify-center items-center"
                            >
                                {reviewLoading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Submit Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">Please log in to share your experience.</p>
                            <Link to={`/login?redirect=/products/${id}`} className="inline-block bg-gold-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-gold-700 transition-colors">
                                Sign In
                            </Link>
                        </div>
                    )}
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Product;