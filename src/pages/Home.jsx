import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import API from '../lib/api';
import { ArrowRight, Star } from 'lucide-react';

const ProductCard = ({ product }) => (
  <Link to={`/products/${product._id}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
    <div className="relative overflow-hidden mb-4 bg-gray-100 aspect-[3/4]">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {product.isFeatured && <span className="absolute top-2 left-2 bg-gold-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Featured</span>}
    </div>
    <div className="text-center p-4">
      <h3 className="text-lg font-serif font-medium group-hover:text-gold-600 transition-colors">{product.title}</h3>
      <p className="text-gray-500 text-sm mb-2">{product.category}</p>
      <div className="flex justify-center items-center gap-2">
        <p className="font-bold text-gray-900">${product.variants?.[0]?.price || product.price}</p>
        {product.rating > 0 && <span className="text-xs flex items-center text-gold-500"><Star className="w-3 h-3 fill-current mr-0.5" /> {product.rating.toFixed(1)}</span>}
      </div>
    </div>
  </Link>
);

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts } = useSelector((state) => state.products);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    fetchBanners();
  }, [dispatch]);

  const fetchBanners = async () => {
    try {
      const response = await API.get('/admin/banners');
      const activeBanners = response.data.data.filter(b => b.isActive);
      setBanners(activeBanners);
    } catch (error) {
      console.error("Failed to load banners");
    }
  }

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section - Dynamic Banners */}
      <section className="h-[90vh] relative bg-gray-900 overflow-hidden">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === activeBannerIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">
                    {banner.title}
                  </h1>
                  {banner.link && (
                    <Link to={banner.link} className="inline-flex items-center space-x-2 border-b-2 border-gold-500 pb-2 text-gold-400 hover:text-white hover:border-white transition-all text-lg font-bold tracking-wider">
                      <span>EXPLORE</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Fallback Static Hero
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2574&auto=format&fit=crop" className="w-full h-full object-cover" />
            <div className="relative z-20 h-full flex items-center justify-center text-center text-white p-8">
              <div>
                <span className="block text-gold-400 tracking-[0.3em] text-sm mb-4">NEW COLLECTION</span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                  Essence of <br /> Elegance
                </h1>
                <Link to="/shop" className="inline-flex items-center space-x-2 border-b border-gold-400 pb-1 text-gold-400 hover:text-white hover:border-white transition-all">
                  <span>DISCOVER NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Banner Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === activeBannerIndex ? 'bg-gold-500 w-8' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-gold-600 text-sm font-bold tracking-widest uppercase mb-2 block">Exclusive</span>
          <h2 className="text-3xl font-serif font-bold mb-4 text-brand-dark">Curated Scents</h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto"></div>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading featured collections...</p>
        )}

        <div className="text-center mt-12">
          <Link to="/shop" className="inline-block border border-brand-dark text-brand-dark px-8 py-3 rounded-full font-bold hover:bg-brand-dark hover:text-white transition-colors">
            View All Fragrances
          </Link>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 h-[500px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcPfwC1RSP1YviVjcU4XRPmWJDgueaZsDdVQ&s"
              alt="Luxury Perfume"
              className="w-full h-full object-cover shadow-2xl rounded-lg"
            />
          </div>
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-4xl font-serif font-bold text-brand-dark">The Art of Perfumery</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe perfume is more than just a scent—it is a memory, an emotion, a statement. Our collections are sourced from the finest ingredients globally, ensuring long-lasting luxury.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="font-bold text-lg mb-2">100% Authentic</h4>
                <p className="text-sm text-gray-500">Sourced directly from master perfumers.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Cruelty Free</h4>
                <p className="text-sm text-gray-500">Ethically crafted with care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;