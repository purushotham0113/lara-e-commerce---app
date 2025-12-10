import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, addToCart } from '../store/slices/cartSlice';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);

  const checkoutHandler = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/shop" className="text-gold-600 hover:text-gold-700 font-bold underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={`${item.product}-${item.size}`} className="flex items-center bg-white p-4 border rounded-lg shadow-sm">
                <img src={item.image} alt={item.title} className="w-20 h-24 object-cover rounded mr-6" />
                
                <div className="flex-1">
                  <Link to={`/products/${item.product}`} className="text-lg font-bold text-brand-dark hover:text-gold-600">
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <p className="font-bold mt-1">${item.price}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={item.quantity}
                    onChange={(e) => 
                      dispatch(addToCart({ ...item, quantity: Number(e.target.value) }))
                    }
                    className="border rounded p-1"
                  >
                    {[...Array(Math.min(10, item.countInStock || 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => dispatch(removeFromCart({ id: item.product, size: item.size }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-80 h-fit bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>${total}</span>
            </div>
            <div className="border-t pt-4 mt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
            <button
              onClick={checkoutHandler}
              className="w-full bg-brand-dark text-white py-3 rounded hover:bg-gold-600 transition-colors font-bold"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;