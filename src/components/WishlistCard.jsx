import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Trash2, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { removeFromWishlist } from '../services/api';

const WishlistCard = ({ product, onRemoveSuccess }) => {
  const { _id, name, price, category, image, stock, description } = product;

  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setRemoveError(null);
      await removeFromWishlist(_id);
      if (onRemoveSuccess) {
        onRemoveSuccess(_id);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      if (err.response?.status === 401) {
        setRemoveError('Please sign in first');
      } else if (err.response?.status === 404) {
        setRemoveError('Product not in wishlist');
        if (onRemoveSuccess) onRemoveSuccess(_id);
      } else {
        setRemoveError('Failed to remove');
      }
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      className="card card-hover wishlist-card"
      id={`wishlist-card-${_id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
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

        {/* Wishlist Heart Icon Badge (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.45rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Heart size={16} fill="#ef4444" color="#ef4444" />
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

        {/* Price & Stock info */}
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
                Stock Status
              </span>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a' }}>
                {isOutOfStock ? '0 units left' : `${stock} units left`}
              </p>
            </div>
          </div>

          {removeError && (
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
              {removeError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to={`/products/${_id}`}
              id={`wishlist-view-btn-${_id}`}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Eye size={15} />
              View Details
            </Link>

            <button
              type="button"
              id={`wishlist-remove-btn-${_id}`}
              onClick={handleRemove}
              disabled={removing}
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: removing ? 'not-allowed' : 'pointer',
                opacity: removing ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {removing ? (
                <>
                  <Loader2 size={14} className="spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Remove from Wishlist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
