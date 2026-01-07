import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    fetchProducts,
    deleteProduct,
    resetProductState,
    updateProduct,
} from '../store/slices/productSlice';
import {
    listOrders,
    listVendorOrders,
    deliverOrder,
    resetDeliver,
    updateItemStatus,
} from '../store/slices/orderSlice';
import API from '../lib/api';
import {
    Plus,
    Package,
    BarChart,
    Trash2,
    Edit,
    Users,
    AlertTriangle,
    Truck,
    Image as ImageIcon,
    Tag,
    RefreshCcw,
    Star,
    DollarSign,
} from 'lucide-react';

const Dashboard = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const { products } = useSelector((state) => state.products);
    const { orders, successDeliver, successUpdate } = useSelector(
        (state) => state.orders
    );

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    const [stats, setStats] = useState(null);

    // Banners State
    const [banners, setBanners] = useState([]);
    const [bannerForm, setBannerForm] = useState({
        title: '',
        image: '',
        link: '',
        position: 0,
    });
    const [isAddingBanner, setIsAddingBanner] = useState(false);

    // Coupons State
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({
        code: '',
        discountPercentage: 10,
        expiryDate: '',
    });
    const [isAddingCoupon, setIsAddingCoupon] = useState(false);

    // Returns State
    const [returns, setReturns] = useState([]);

    const fetchData = () => {
        if (activeTab === 'dashboard') fetchStats();
        if (activeTab === 'products') dispatch(fetchProducts());
        if (activeTab === 'orders') {
            if (user?.isAdmin) dispatch(listOrders());
            if (user?.isVendor) dispatch(listVendorOrders());
        }
        if (activeTab === 'users' && user?.isAdmin) fetchUsers();
        if (activeTab === 'banners' && user?.isAdmin) fetchBanners();
        if (activeTab === 'coupons' && user?.isAdmin) fetchCoupons();
        if (activeTab === 'returns' && user?.isAdmin) fetchReturns();
    };

    // --- API CALLS ---
    const fetchStats = async () => {
        try {
            const endpoint = user.isAdmin ? '/admin/stats' : '/vendor/stats';
            const response = await API.get(endpoint);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await API.get('/admin/users');
            setUsers(response.data.data);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await API.get('/admin/banners');
            setBanners(res.data.data);
        } catch (e) { }
    };

    const fetchCoupons = async () => {
        try {
            const res = await API.get('/coupons');
            setCoupons(res.data.data);
        } catch (e) { }
    };

    const fetchReturns = async () => {
        try {
            const res = await API.get('/returns');
            setReturns(res.data.data);
        } catch (e) { }
    };

    // --- HANDLERS ---
    const toggleFeatureProduct = (product) => {
        dispatch(
            updateProduct({ _id: product._id, isFeatured: !product.isFeatured })
        );
    };

    const toggleApproveProduct = (product) => {
        dispatch(
            updateProduct({ _id: product._id, isApproved: !product.isApproved })
        );
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/banners', bannerForm);
            setIsAddingBanner(false);
            setBannerForm({ title: '', image: '', link: '', position: 0 });
            fetchBanners();
        } catch (e) {
            alert(e.response?.data?.message);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Delete Banner?')) return;
        await API.delete(`/admin/banners/${id}`);
        fetchBanners();
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/coupons', couponForm);
            setIsAddingCoupon(false);
            setCouponForm({ code: '', discountPercentage: 10, expiryDate: '' });
            fetchCoupons();
        } catch (e) {
            alert(e.response?.data?.message);
        }
    };

    const handleReturnStatus = async (id, status) => {
        try {
            await API.patch(`/returns/${id}`, { status });
            fetchReturns();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleResetPassword = async (id) => {
        const password = prompt('Enter new password for user:');
        if (password) {
            try {
                await API.put(`/admin/users/${id}/reset-password`, { password });
                alert('Password reset successfully');
            } catch (e) {
                alert('Failed to reset password');
            }
        }
    };

    useEffect(() => {
        dispatch(resetProductState());
        fetchData();
    }, [dispatch, activeTab, user]);

    useEffect(() => {
        if (successDeliver || successUpdate) {
            dispatch(resetDeliver());
            fetchData();
        }
    }, [successDeliver, successUpdate, dispatch, user]);

    // --- FILTERING ---
    const displayedProducts = user.isAdmin
        ? products
        : products.filter((p) => p.user === user._id);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (!user || (!user.isAdmin && !user.isVendor))
        return <div className="p-20 text-center">Access Denied</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row animate-fade-in">
            {/* Sidebar */}

            <aside
                className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >

                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-serif font-bold text-brand-dark">
                        Dashboard
                    </h2>
                    <p
                        className={`text-xs text-white px-2 py-0.5 mt-2 inline-block font-bold tracking-wider rounded ${user.isAdmin ? 'bg-gold-500' : 'bg-blue-500'
                            }`}
                    >
                        {user.isAdmin ? 'ADMINISTRATOR' : 'VENDOR'}
                    </p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Analytics', icon: BarChart },
                        { id: 'orders', label: 'Orders', icon: Truck },
                        { id: 'products', label: 'Products', icon: Package },
                        ...(user.isAdmin
                            ? [
                                { id: 'users', label: 'Users', icon: Users },
                                { id: 'banners', label: 'Banners', icon: ImageIcon },
                                { id: 'coupons', label: 'Coupons', icon: Tag },
                                { id: 'returns', label: 'Returns', icon: RefreshCcw },
                            ]
                            : []),
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id
                                ? 'bg-brand-dark text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {showSidebar && (
                <div
                    onClick={() => setShowSidebar(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}



            {/* Main Content */}

            {/* <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen"> */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">


                <header className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="md:hidden bg-brand-dark text-white px-3 py-2 rounded"
                    >
                        SIdeBar
                    </button>

                    <h1 className="text-3xl font-serif font-bold text-gray-800 capitalize">
                        {activeTab}
                    </h1>
                    {activeTab === 'products' && (
                        <Link
                            to="/admin/product/create"
                            className="bg-gold-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-gold-600"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </Link>
                    )}
                    {activeTab === 'banners' && (
                        <button
                            onClick={() => setIsAddingBanner(true)}
                            className="bg-gold-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-gold-600"
                        >
                            <Plus className="w-4 h-4" /> Add Banner
                        </button>
                    )}
                    {activeTab === 'coupons' && (
                        <button
                            onClick={() => setIsAddingCoupon(true)}
                            className="bg-gold-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-gold-600"
                        >
                            <Plus className="w-4 h-4" /> Create Coupon
                        </button>
                    )}
                </header>

                {/* --- ANALYTICS --- */}
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">
                                            Revenue
                                        </p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            ${stats.totalRevenue.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-green-100 text-green-600 rounded">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">
                                            Orders
                                        </p>
                                        <h3 className="text-2xl font-bold mt-1">

                                            {stats.orderCount}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            {user.isAdmin && (
                                <>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-500 text-xs font-bold uppercase">
                                                    Users
                                                </p>
                                                <h3 className="text-2xl font-bold mt-1">
                                                    {stats.userCount}
                                                </h3>
                                            </div>
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded">
                                                <Users className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-500 text-xs font-bold uppercase">
                                                    Pending Vendors
                                                </p>
                                                <h3 className="text-2xl font-bold mt-1 text-orange-600">
                                                    {stats.pendingVendors}
                                                </h3>
                                            </div>
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {user.isAdmin && stats.paymentBreakdown && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl border shadow-sm">
                                    <h3 className="font-bold mb-4">Payment Methods</h3>
                                    {stats.paymentBreakdown.map((p) => (
                                        <div
                                            key={p._id}
                                            className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                                        >
                                            <span className="font-medium">{p._id}</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                {p.count} Orders (${p.revenue.toLocaleString()})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white p-6 rounded-xl border shadow-sm">
                                    <h3 className="font-bold mb-4">Top Selling Products</h3>
                                    {stats.topProducts &&
                                        stats.topProducts.map((p) => (
                                            <div
                                                key={p._id}
                                                className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                                            >
                                                <span className="font-medium truncate w-2/3">
                                                    {p.title}
                                                </span>
                                                <span className="text-sm font-bold text-green-600">
                                                    {p.sold} Sold
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-gray-50 border-b uppercase text-xs">
                                <tr>
                                    <th className="px-2 md:px-6 py-4">Product</th>
                                    <th className="px-2 md:px-6 py-4">Price</th>
                                    <th className="px-2 md:px-6 py-4">Stock</th>
                                    <th className="px-2 md:px-6 py-4">Status</th>
                                    <th className="px-2 md:px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {displayedProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50">
                                        <td className="px-2 md:px-6 py-4 flex items-center gap-3">
                                            <img
                                                src={p.image}
                                                className="w-10 h-10 rounded object-cover border"
                                            />
                                            <div>
                                                <div className="font-bold">{p.title}</div>
                                                {p.isFeatured && (
                                                    <span className="text-[10px] bg-gold-100 text-gold-700 px-1 rounded uppercase font-bold">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-6 py-4">
                                            ${p.variants?.[0]?.price}
                                        </td>
                                        <td className="px-2 md:px-6 py-4">
                                            {p.variants?.reduce((a, b) => a + b.stock, 0)}
                                        </td>
                                        <td className="px-2 md:px-6 py-4">
                                            <button
                                                disabled={!user.isAdmin}
                                                onClick={() => toggleApproveProduct(p)}
                                                className={`px-2 py-1 rounded text-xs font-bold ${p.isApproved
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {p.isApproved ? 'Approved' : 'Pending'}
                                            </button>
                                        </td>
                                        <td className="px-2 md:px-6 py-4 text-right flex justify-end gap-2">
                                            {user.isAdmin && (
                                                <button
                                                    onClick={() => toggleFeatureProduct(p)}
                                                    className={`p-1.5 rounded ${p.isFeatured
                                                        ? 'text-gold-500 bg-gold-50'
                                                        : 'text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                    title="Toggle Feature"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/admin/product/${p._id}/edit`}
                                                className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => dispatch(deleteProduct(p._id))}
                                                className="p-1.5 rounded text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- BANNERS --- */}
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        {isAddingBanner && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold mb-4">Add New Banner</h3>
                                <form
                                    onSubmit={handleBannerSubmit}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <input
                                        required
                                        placeholder="Title"
                                        value={bannerForm.title}
                                        onChange={(e) =>
                                            setBannerForm({ ...bannerForm, title: e.target.value })
                                        }
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        required
                                        placeholder="Image URL"
                                        value={bannerForm.image}
                                        onChange={(e) =>
                                            setBannerForm({ ...bannerForm, image: e.target.value })
                                        }
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        placeholder="Link (Optional)"
                                        value={bannerForm.link}
                                        onChange={(e) =>
                                            setBannerForm({ ...bannerForm, link: e.target.value })
                                        }
                                        className="border p-2 rounded md:col-span-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Position"
                                        value={bannerForm.position}
                                        onChange={(e) =>
                                            setBannerForm({
                                                ...bannerForm,
                                                position: e.target.value,
                                            })
                                        }
                                        className="border p-2 rounded"
                                    />
                                    <div className="col-span-1 md:col-span-2 flex gap-2">
                                        <button
                                            type="submit"
                                            className="bg-brand-dark text-white px-4 py-2 rounded"
                                        >
                                            Save Banner
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingBanner(false)}
                                            className="bg-gray-200 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {banners.map((banner) => (
                                <div
                                    key={banner._id}
                                    className="bg-white rounded-xl border shadow-sm overflow-hidden group"
                                >
                                    <div className="h-40 bg-gray-100 relative">
                                        <img
                                            src={banner.image}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteBanner(banner._id)}
                                                className="bg-red-500 text-white p-1 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold truncate">{banner.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            Pos: {banner.position} •{' '}
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- COUPONS --- */}
                {activeTab === 'coupons' && (
                    <div className="space-y-6">
                        {isAddingCoupon && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold mb-4">Create Coupon</h3>
                                <form
                                    onSubmit={handleCouponSubmit}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    <input
                                        required
                                        placeholder="Code (e.g. SALE10)"
                                        value={couponForm.code}
                                        onChange={(e) =>
                                            setCouponForm({ ...couponForm, code: e.target.value })
                                        }
                                        className="border p-2 rounded uppercase"
                                    />
                                    <input
                                        required
                                        type="number"
                                        placeholder="Discount %"
                                        value={couponForm.discountPercentage}
                                        onChange={(e) =>
                                            setCouponForm({
                                                ...couponForm,
                                                discountPercentage: e.target.value,
                                            })
                                        }
                                        className="border p-2 rounded"
                                    />
                                    <input
                                        required
                                        type="date"
                                        value={couponForm.expiryDate}
                                        onChange={(e) =>
                                            setCouponForm({
                                                ...couponForm,
                                                expiryDate: e.target.value,
                                            })
                                        }
                                        className="border p-2 rounded"
                                    />
                                    <div className="col-span-1 md:col-span-3 flex gap-2">
                                        <button
                                            type="submit"
                                            className="bg-brand-dark text-white px-4 py-2 rounded"
                                        >
                                            Create
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCoupon(false)}
                                            className="bg-gray-200 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="bg-white rounded-xl border overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Discount</th>
                                        <th className="px-4 py-3">Expiry</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {coupons.map((c) => (
                                        <tr key={c._id}>
                                            <td className="px-4 py-4 font-bold">{c.code}</td>
                                            <td className="px-4 py-4">
                                                {c.discountPercentage}%
                                            </td>
                                            <td className="px-4 py-4">
                                                {new Date(c.expiryDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${c.isActive &&
                                                        new Date(c.expiryDate) > new Date()
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {c.isActive &&
                                                        new Date(c.expiryDate) > new Date()
                                                        ? 'Active'
                                                        : 'Expired/Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- USERS --- */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl border overflow-x-auto">
                        <div className="p-4 border-b bg-gray-50 flex">
                            <input
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="border p-2 rounded w-full max-w-sm"
                            />
                        </div>
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isAdmin
                                                ? 'Admin'
                                                : u.isVendor
                                                    ? 'Vendor'
                                                    : 'Customer'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isBlocked ? (
                                                <span className="text-red-600 font-bold">
                                                    Blocked
                                                </span>
                                            ) : u.isVendor && !u.isApproved ? (
                                                <span className="text-orange-500">Pending</span>
                                            ) : (
                                                <span className="text-green-600">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {!u.isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleResetPassword(u._id)}
                                                        className="text-blue-500 hover:underline text-xs mr-2"
                                                    >
                                                        Reset Pass
                                                    </button>
                                                    {u.isVendor && !u.isApproved && (
                                                        <button
                                                            onClick={async () => {
                                                                await API.put(
                                                                    `/admin/users/${u._id}/approve`
                                                                );
                                                                fetchUsers();
                                                            }}
                                                            className="text-green-600 font-bold text-xs mr-2"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            await API.put(
                                                                `/admin/users/${u._id}/block`
                                                            );
                                                            fetchUsers();
                                                        }}
                                                        className="text-orange-600 text-xs mr-2"
                                                    >
                                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Delete?')) {
                                                                await API.delete(
                                                                    `/admin/users/${u._id}`
                                                                );
                                                                fetchUsers();
                                                            }
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- RETURNS --- */}
                {activeTab === 'returns' && (
                    <div className="bg-white rounded-xl border overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {returns.map((ret) => (
                                    <tr key={ret._id}>
                                        <td className="px-6 py-4 font-bold">
                                            #{ret.order?._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">{ret.reason}</td>
                                        <td className="px-6 py-4">${ret.refundAmount}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${ret.status === 'Approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : ret.status === 'Rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100'
                                                    }`}
                                            >
                                                {ret.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {ret.status === 'Pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleReturnStatus(ret._id, 'Approved')
                                                        }
                                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleReturnStatus(ret._id, 'Rejected')
                                                        }
                                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- ORDERS --- */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const relevantItems = user.isAdmin
                                ? order.orderItems
                                : order.orderItems.filter(
                                    (item) => item.vendor === user._id
                                );
                            if (relevantItems.length === 0) return null;
                            return (
                                <div
                                    key={order._id}
                                    className="bg-white mb-4 border rounded-lg p-6 shadow-sm text-sm"
                                >
                                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                                        <div>
                                            <span className="font-bold text-brand-dark">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-xs font-bold px-2 py-1 rounded inline-block ${order.isPaid
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {order.isPaid ? 'PAID' : 'PENDING'}
                                            </div>
                                            {user.isAdmin && !order.isDelivered && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Mark Delivered?'))
                                                            dispatch(deliverOrder(order._id));
                                                    }}
                                                    className="block mt-2 text-xs text-gold-600 hover:underline"
                                                >
                                                    Mark All Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm min-w-[500px]">
                                            <tbody>
                                                {relevantItems.map((item, idx) => (
                                                    <tr key={idx} className="border-t">
                                                        <td className="py-2">
                                                            {item.title} ({item.size})
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            <span className="bg-gray-100 px-2 rounded text-xs">
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {(user.isVendor || user.isAdmin) && (
                                                                <select
                                                                    className="text-xs border rounded p-1 w-full md:w-auto"
                                                                    value={item.status}
                                                                    onChange={(e) => {
                                                                        dispatch(
                                                                            updateItemStatus({
                                                                                orderId: order._id,
                                                                                itemId: item._id,
                                                                                status: e.target.value,
                                                                            })
                                                                        );
                                                                    }}
                                                                >
                                                                    <option value="Processing">
                                                                        Processing
                                                                    </option>
                                                                    <option value="Shipped">
                                                                        Shipped
                                                                    </option>
                                                                    <option value="Delivered">
                                                                        Delivered
                                                                    </option>
                                                                </select>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
