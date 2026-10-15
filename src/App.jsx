import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { getMe, getWishlist } from './services/api';
import { CartProvider } from './context/CartContext';

function App() {
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  // Check auth session on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        // User not logged in
        setUser(null);
      } finally {
        setInitialCheckComplete(true);
      }
    };

    verifyAuth();
  }, []);

  // Fetch wishlist count when user is logged in
  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const data = await getWishlist();
        setWishlistCount(data.count || (data.wishlist ? data.wishlist.length : 0));
      } catch (err) {
        console.error('Error fetching wishlist count:', err);
      }
    };

    fetchCount();
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setWishlistCount(0);
  };

  return (
    <CartProvider user={user}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>

        {/* Navbar */}
        <Navbar user={user} onLogout={handleLogout} wishlistCount={wishlistCount} />

        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Registration Route */}
            <Route path="/register" element={<Register />} />

            {/* Login Route */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Public Home / Landing Route */}
            <Route path="/" element={<Home user={user} setUser={setUser} />} />

            {/* Customer Private Dashboard Route */}
            <Route
              path="/dashboard"
              element={<Dashboard user={user} setUser={setUser} />}
            />
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />

            {/* Product Catalog & Discovery Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Wishlist Route */}
            <Route
              path="/wishlist"
              element={<Wishlist user={user} onWishlistCountChange={setWishlistCount} />}
            />

            {/* Cart Route */}
            <Route
              path="/cart"
              element={<Cart user={user} />}
            />

            {/* Checkout Route */}
            <Route
              path="/checkout"
              element={<Checkout user={user} />}
            />

            {/* Orders Routes */}
            <Route
              path="/orders"
              element={<Orders user={user} />}
            />
            <Route
              path="/orders/:id"
              element={<OrderDetails user={user} />}
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
}

export default App;

