import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, updateProduct, createProduct, resetProductState } from '../store/slices/productSlice';
import API from '../lib/api';
import { ArrowLeft, Upload, Plus, Trash, Loader2, Image as ImageIcon, Package } from 'lucide-react';

const ProductEdit = () => {
  const { id } = useParams(); // id is undefined in Create mode
  const isEditMode = !!id;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading, error, successUpdate, successCreate } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Handle successful actions
    if (successUpdate || successCreate) {
      dispatch(resetProductState());
      navigate('/admin');
    }

    // Logic for loading data
    if (isEditMode) {
      if (!product || product._id !== id) {
        dispatch(fetchProductDetails(id));
      } else {
        // SECURITY: If vendor tries to edit someone else's product
        if (!user.isAdmin && product.user !== user._id) {
          navigate('/admin');
          return;
        }

        // Populate form with existing data
        setTitle(product.title);
        setPrice(product.price || 0);
        setImage(product.image);
        setImages(product.images || []);
        setCategory(product.category);
        setGender(product.gender);
        setDescription(product.description);
        setVariants(product.variants || []);
      }
    } else {
      // Create Mode: Reset state if we are navigating from edit to create
      if (product && product._id) {
        dispatch(resetProductState());
        setTitle(''); setPrice(0); setImage(''); setImages([]); setCategory(''); setGender('Unisex'); setDescription(''); setVariants([]);
      }
    }
  }, [dispatch, product, id, successUpdate, successCreate, navigate, isEditMode, user]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await API.post('/upload', formData, config);
      setImage(response.data.data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const productData = {
      title,
      price,
      image,
      images,
      category,
      gender,
      description,
      variants,
    };

    if (isEditMode) {
      dispatch(updateProduct({ _id: id, ...productData }));
    } else {
      dispatch(createProduct(productData));
    }
  };

  const handleVariantChange = (index, key, value) => {
    const newVariants = [...variants];
    newVariants[index][key] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: '50ml', price: 0, stock: 0 }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addExtraImage = () => {
    if (newImageUrl) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeExtraImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center text-gray-500 hover:text-brand-dark mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-brand-dark">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isEditMode ? 'Update product details, pricing, and inventory.' : 'Fill in the details below to add a new product.'}
            </p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded mb-6 border border-red-200">{error}</div>}

        <form onSubmit={submitHandler} className="space-y-8">

          {/* Main Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><Package className="w-5 h-5 mr-2 text-gold-500" /> Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-gray-200 rounded-lg focus:ring-gold-500 focus:border-gold-500 p-3 bg-gray-50 border" placeholder="e.g. Midnight Rose" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-gray-200 rounded-lg focus:ring-gold-500 focus:border-gold-500 p-3 bg-gray-50 border appearance-none">
                    <option value="">Select Category</option>
                    <option value="Floral">Floral</option>
                    <option value="Woody">Woody</option>
                    <option value="Citrus">Citrus</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Oriental">Oriental</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border-gray-200 rounded-lg focus:ring-gold-500 focus:border-gold-500 p-3 bg-gray-50 border appearance-none">
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea required rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border-gray-200 rounded-lg focus:ring-gold-500 focus:border-gold-500 p-3 bg-gray-50 border" placeholder="Describe the scent notes..."></textarea>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-gold-500" /> Media</h3>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Main Image</label>
              <div className="flex items-start space-x-6">
                <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="flex-1 border-gray-200 rounded-lg p-2.5 bg-gray-50 border text-sm" placeholder="Paste Image URL" />
                    <span className="text-gray-400 text-sm">OR</span>
                    <label className={`cursor-pointer bg-brand-dark text-white hover:bg-gold-600 px-4 py-2.5 rounded-lg flex items-center transition-colors text-sm font-bold ${uploading ? 'opacity-50' : ''}`}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Upload
                      <input type="file" accept="image/*" className="hidden" onChange={uploadFileHandler} disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Recommended size: 800x1000px. JPG, PNG or WEBP.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Gallery Images</label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative w-24 h-32 group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeExtraImage(i)} className="text-white hover:text-red-400">
                        <Trash className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-2 text-center hover:border-gold-500 hover:bg-gold-50 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 mb-2" />
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtraImage(); } }}
                    placeholder="URL + Enter"
                    className="w-full text-xs bg-transparent text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Product Variants</h3>
              <button type="button" onClick={addVariant} className="text-sm font-bold text-gold-600 hover:text-gold-700 flex items-center bg-gold-50 px-3 py-1.5 rounded-lg border border-gold-200">
                <Plus className="w-4 h-4 mr-1" /> Add Size
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((v, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Size</label>
                    <select value={v.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-full border-gray-200 rounded-lg p-2.5 bg-white border">
                      <option value="50ml">50ml</option>
                      <option value="100ml">100ml</option>
                      <option value="200ml">200ml</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price ($)</label>
                    <input type="number" value={v.price} onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))} className="w-full border-gray-200 rounded-lg p-2.5 bg-white border" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stock Qty</label>
                    <input type="number" value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} className="w-full border-gray-200 rounded-lg p-2.5 bg-white border" />
                  </div>
                  <button type="button" onClick={() => removeVariant(index)} className="absolute top-2 right-2 md:static md:mt-0 text-gray-400 hover:text-red-500 p-2 transition-colors">
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {variants.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No variants added. Please add at least one size.</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-12">
            <Link to="/admin" className="px-6 py-3 mr-4 text-gray-600 hover:text-gray-900 font-bold transition-colors">Cancel</Link>
            <button type="submit" className="bg-brand-dark text-white px-10 py-3 rounded-lg hover:bg-gold-600 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide">
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;