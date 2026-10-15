import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, loading, error, cartItemCount, subtotal, fetchCart } = useCart();

  // 1. Unauthenticated state
  if (!user) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShoppingCart size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Please Sign In to View Your Cart
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Your shopping cart is tied to your account. Sign in to see items you have added or saved.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}>
              Sign In Now
            </Link>
            <Link to="/products" className="btn btn-ghost" style={{ padding: '0.75rem 1.25rem' }}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '5rem 2rem',
            border: '1px solid var(--border-light)',
            gap: '1.25rem',
          }}
        >
          <div
            className="spinner spinner-dark"
            style={{
              width: '42px',
              height: '42px',
              borderWidth: '3.5px',
              borderColor: 'var(--primary-soft)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error && cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--error-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--error-bg)',
              color: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to load your cart
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={fetchCart}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // 4. Empty state
  if (cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '5rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '3.5rem',
              marginBottom: '1rem',
            }}
          >
            🛒
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Your cart is empty
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Looks like you haven't added anything yet. Explore our top tech gear and lifestyle items to get started!
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShoppingBag size={18} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 5. Active Cart Page
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      
      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              My Cart <span style={{ fontSize: '1rem', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Review your selected products before proceeding to checkout.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 600 }}
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(320px, 380px)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="cart-page-layout"
        >
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item, index) => (
              <CartItem key={item.product?._id || index} item={item} />
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px',
            }}
            id="order-summary-box"
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <span>Total Items</span>
                <span id="summary-items-count" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cartItemCount} {cartItemCount === 1 ? 'unit' : 'units'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <span>Unique Products</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cartItems.length}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <span>Delivery Charges</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                  FREE
                </span>
              </div>
            </div>

            {/* Total Divider */}
            <div style={{ paddingTop: '1rem', borderTop: '1.5px dashed var(--border-light)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Subtotal
                </span>
                <span
                  id="summary-subtotal"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              id="proceed-to-checkout-btn"
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem 1.25rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(255,87,34,0.3)',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust Badges */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span>100% Secure & Encrypted Checkout</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Truck size={16} color="var(--primary)" />
                <span>Fast & Free Express Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
