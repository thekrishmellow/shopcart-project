import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, CheckCircle2, AlertTriangle, XCircle, Loader2, ShoppingCart } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialSaved = false, onWishlistChange }) => {
  const { _id, name, price, category, image, stock, description } = product;
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity, itemLoadingMap } = useCart();

  const [saved, setSaved] = useState(initialSaved);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isAddingCart = !!itemLoadingMap[_id];
  const inCart = isInCart(_id);
  const inCartQty = getItemQuantity(_id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingCart) return;

    try {
      setErrorMessage(null);
      const res = await addToCart(_id);
      if (!res.success) {
        if (res.requireAuth) {
          setErrorMessage('Please sign in to add products to cart.');
        } else {
          setErrorMessage(res.message);
        }
        setTimeout(() => setErrorMessage(null), 3500);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setErrorMessage('Failed to add product to cart.');
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWishlist) return;

    try {
      setLoadingWishlist(true);
      setErrorMessage(null);

      if (saved) {
        await removeFromWishlist(_id);
        setSaved(false);
        if (onWishlistChange) onWishlistChange(_id, false);
      } else {
        await addToWishlist(_id);
        setSaved(true);
        if (onWishlistChange) onWishlistChange(_id, true);
      }
    } catch (err) {
      console.error('Wishlist action error:', err);
      if (err.response?.status === 401) {
        setErrorMessage('Please sign in to save products.');
      } else if (err.response?.status === 409) {
        setSaved(true); // Already in wishlist
        setErrorMessage(null);
      } else {
        setErrorMessage('Unable to save product. Please try again.');
      }
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <div
      className="card card-hover product-card"
      id={`product-card-${_id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* ── Product Image Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 Aspect ratio
          overflow: 'hidden',
          backgroundColor: '#f3f3f8',
        }}
      >
        <img
          src={image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="product-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge (Top Left) */}
        <span
          className="badge"
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          {category}
        </span>

        {/* Stock Badge (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
          }}
        >
          {isOutOfStock ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: '#fee2e2',
                color: '#dc2626',
                boxShadow: '0 2px 6px rgba(220,38,38,0.15)',
              }}
            >
              <XCircle size={11} /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: '#fef3c7',
                color: '#d97706',
                boxShadow: '0 2px 6px rgba(217,119,6,0.15)',
              }}
            >
              <AlertTriangle size={11} /> Only {stock} left
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: '#dcfce7',
                color: '#16a34a',
                boxShadow: '0 2px 6px rgba(22,163,74,0.15)',
              }}
            >
              <CheckCircle2 size={11} /> {stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* ── Product Info & Actions ── */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '0.9rem',
        }}
      >
        <div>
          {/* Title */}
          <Link to={`/products/${_id}`}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.35,
                marginBottom: '0.35rem',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'color 0.15s ease',
              }}
              title={name}
            >
              {name}
            </h3>
          </Link>

          {/* Description snippet */}
          {description && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Price and Stock status details */}
        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Price
              </span>
              <p
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                ₹{Number(price).toLocaleString('en-IN')}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Availability
              </span>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: isOutOfStock ? '#dc2626' : 'var(--text-secondary)' }}>
                {isOutOfStock ? '0 units left' : `${stock} units left`}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.4rem 0.6rem',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Action Buttons: Add to Cart & View Details / Wishlist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              id={`add-to-cart-btn-${_id}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingCart}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock || isAddingCart ? 'not-allowed' : 'pointer',
              }}
            >
              {isAddingCart ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>{inCart ? `Add Another (${inCartQty})` : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to={`/products/${_id}`}
                id={`view-details-btn-${_id}`}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <Eye size={14} />
                View Details
              </Link>

              <button
                type="button"
                id={`wishlist-btn-${_id}`}
                onClick={handleWishlistToggle}
                disabled={loadingWishlist}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  background: saved ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-page)',
                  color: saved ? '#ef4444' : 'var(--text-secondary)',
                  border: `1px solid ${saved ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-light)'}`,
                  cursor: loadingWishlist ? 'not-allowed' : 'pointer',
                  opacity: loadingWishlist ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                title={saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {loadingWishlist ? (
                  <Loader2 size={14} className="spin" />
                ) : saved ? (
                  <Heart size={14} fill="#ef4444" color="#ef4444" />
                ) : (
                  <Heart size={14} color="var(--text-secondary)" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
