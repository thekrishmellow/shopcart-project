import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';
import { Heart, RefreshCw, AlertCircle, ShoppingBag, Sparkles, ArrowLeft } from 'lucide-react';

const Wishlist = ({ user, onWishlistCountChange }) => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlistData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      const items = data.wishlist || [];
      setWishlist(items);
      if (onWishlistCountChange) {
        onWishlistCountChange(items.length);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        setError('Please sign in to view your wishlist.');
      } else {
        setError("We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, [onWishlistCountChange]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleRemoveSuccess = (removedId) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item._id !== removedId);
      if (onWishlistCountChange) {
        onWishlistCountChange(updated.length);
      }
      return updated;
    });
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      
      {/* ── Page Banner / Header ── */}
      <section
        style={{
          background: '#09090b',
          color: '#ffffff',
          padding: '3.5rem 1.5rem 2.85rem',
          borderBottom: '1px solid #27272a',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '450px', height: '450px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '650px' }}>
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginBottom: '0.85rem',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                letterSpacing: '0.04em',
              }}
            >
              <Heart size={13} fill="#ef4444" /> MY SAVED ITEMS
            </span>
            <h1
              style={{
                fontSize: '2.75rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '0.6rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              My Wishlist<span style={{ color: '#ef4444' }}>.</span>
            </h1>
            <p style={{ color: 'var(--grey-400)', fontSize: '1rem', lineHeight: 1.6 }}>
              {loading
                ? 'Loading your saved products...'
                : `${wishlist.length} product${wishlist.length === 1 ? '' : 's'} saved for later`}
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <div className="page-container">

        {/* ── 1. Loading State ── */}
        {loading && (
          <div
            id="wishlist-loading-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 1rem',
              gap: '1.25rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="spinner spinner-dark"
              style={{
                width: '42px',
                height: '42px',
                borderWidth: '3.5px',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                borderTopColor: '#ef4444',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Loading your wishlist...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                Fetching your saved items from ShopKart backend
              </p>
            </div>
          </div>
        )}

        {/* ── 2. Error State ── */}
        {!loading && error && (
          <div
            id="wishlist-error-state"
            style={{
              background: '#ffffff',
              border: '1.5px solid var(--error-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '550px',
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
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Something went wrong.
            </h3>
            <p style={{ color: 'var(--error-text)', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </p>
            <button
              id="wishlist-retry-btn"
              onClick={fetchWishlistData}
              className="btn btn-primary-pill"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.4rem' }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        )}

        {/* ── 3. Empty State ── */}
        {!loading && !error && wishlist.length === 0 && (
          <div
            id="wishlist-empty-state"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '4.5rem 2rem',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Heart size={34} fill="#ef4444" color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Your wishlist is empty ❤️
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              id="browse-products-btn"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.6rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <ShoppingBag size={17} /> Browse Products
            </Link>
          </div>
        )}

        {/* ── 4. Wishlist Grid ── */}
        {!loading && !error && wishlist.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Saved Products ({wishlist.length})
              </span>
              <Link
                to="/products"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShoppingBag size={15} /> Continue Shopping
              </Link>
            </div>

            <div
              id="wishlist-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemoveSuccess={handleRemoveSuccess}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
