import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../lib/api';
import { Filter, Star, X } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ 
      category: '', 
      gender: '', 
      sort: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      keyword: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Only append if truthy
      Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await API.get(`/products?${params.toString()}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error(error);
      // Fallback data
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce keyword search
    const timer = setTimeout(() => {
        fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
      setFilters({ category: '', gender: '', sort: '', minPrice: '', maxPrice: '', rating: '', keyword: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xl font-serif font-bold">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
            </div>
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Reset</button>
          </div>
          
          {/* Search */}
          <div>
              <input 
                type="text" 
                placeholder="Search..." 
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full border rounded p-2 text-sm focus:border-gold-500 outline-none"
              />
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm tracking-wide">GENDER</h3>
            <div className="space-y-2">
              {['Men', 'Women', 'Unisex'].map(g => (
                <label key={g} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    className="accent-gold-600"
                    checked={filters.gender === g}
                    onChange={() => handleFilterChange('gender', g)}
                  />
                  <span className="text-gray-600 text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm tracking-wide">CATEGORY</h3>
            <div className="space-y-2">
              {['Floral', 'Woody', 'Citrus', 'Luxury', 'Oriental'].map(c => (
                <label key={c} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                     type="radio" 
                     name="category" 
                     className="accent-gold-600"
                     checked={filters.category === c}
                     onChange={() => handleFilterChange('category', c)}
                  />
                  <span className="text-gray-600 text-sm">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm tracking-wide">PRICE RANGE</h3>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                />
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-sm tracking-wide">RATING</h3>
             <div className="space-y-2">
                 {[4, 3, 2, 1].map(r => (
                     <button 
                        key={r}
                        onClick={() => handleFilterChange('rating', r === filters.rating ? '' : r)}
                        className={`flex items-center text-sm w-full hover:bg-gray-50 p-1 rounded ${filters.rating === r ? 'bg-gold-50 font-bold' : ''}`}
                     >
                         <div className="flex text-gold-500 mr-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < r ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                         </div>
                         <span className="text-gray-500">& Up</span>
                     </button>
                 ))}
             </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <h1 className="text-3xl font-serif font-bold">All Fragrances <span className="text-base font-sans font-normal text-gray-500">({products.length})</span></h1>
             <select 
               className="border border-gray-300 p-2 rounded text-sm focus:border-gold-500 outline-none"
               onChange={(e) => handleFilterChange('sort', e.target.value)}
               value={filters.sort}
             >
               <option value="">Sort By: Newest</option>
               <option value="price_asc">Price: Low to High</option>
               <option value="price_desc">Price: High to Low</option>
               <option value="rating">Top Rated</option>
             </select>
          </div>
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([key, value]) => {
                  if(!value) return null;
                  return (
                      <span key={key} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs flex items-center capitalize">
                          {key === 'minPrice' ? `Min $${value}` : key === 'maxPrice' ? `Max $${value}` : key === 'rating' ? `${value}+ Stars` : value}
                          <button onClick={() => handleFilterChange(key, '')} className="ml-2 hover:text-red-500"><X className="w-3 h-3"/></button>
                      </span>
                  )
              })}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading fragrances...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          {products.length === 0 && !loading && (
            <div className="text-center py-20 flex flex-col items-center">
                <p className="text-xl text-gray-500 mb-2">No fragrances found.</p>
                <button onClick={clearFilters} className="text-gold-600 hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to={`/products/${product._id}`} className="group bg-white rounded-b-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100">
      <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"></div>
        )}
        <img 
          src={product.image} 
          alt={product.title} 
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
        />
        {product.variants.reduce((acc, v) => acc + v.stock, 0) === 0 && (
            <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 font-bold uppercase tracking-wider">
                Sold Out
            </div>
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-serif font-medium group-hover:text-gold-600 transition-colors truncate">{product.title}</h3>
        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">{product.category} • {product.gender}</p>
        <div className="flex justify-center items-center gap-2">
            <span className="font-bold text-gray-900">${product.variants?.[0]?.price}</span>
            {product.rating > 0 && (
                <div className="flex items-center text-xs text-gold-500">
                    <Star className="w-3 h-3 fill-current mr-1"/> {product.rating.toFixed(1)}
                </div>
            )}
        </div>
      </div>
    </Link>
  );
}

export default Shop;