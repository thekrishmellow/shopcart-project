import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, itemLoadingMap } = useCart();
  const [itemError, setItemError] = useState(null);

  if (!product) return null;

  const { _id, name, price, image, stock } = product;
  const isLoading = !!itemLoadingMap[_id];
  const itemTotal = (price || 0) * (quantity || 1);

  const handleIncrement = async () => {
    if (isLoading) return;
    setItemError(null);
    if (quantity >= stock) {
      setItemError(`Only ${stock} unit${stock === 1 ? '' : 's'} available in stock`);
      setTimeout(() => setItemError(null), 3500);
      return;
    }

    const res = await updateQuantity(_id, quantity + 1);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(null), 3500);
    }
  };

  const handleDecrement = async () => {
    if (isLoading || quantity <= 1) return;
    setItemError(null);

    const res = await updateQuantity(_id, quantity - 1);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(null), 3500);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;
    setItemError(null);
    const res = await removeFromCart(_id);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(null), 3500);
    }
  };

  return (
    <div
      id={`cart-item-${_id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        position: 'relative',
        opacity: isLoading ? 0.75 : 1,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr auto',
          gap: '1.25rem',
          alignItems: 'center',
        }}
        className="cart-item-grid"
      >
        {/* Product Thumbnail */}
        <Link to={`/products/${_id}`} style={{ display: 'block', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f3f3f8', aspectRatio: '1/1' }}>
          <img
            src={image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </Link>

        {/* Product Details & Price */}
        <div>
          <Link to={`/products/${_id}`}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                lineHeight: 1.3,
              }}
            >
              {name}
            </h4>
          </Link>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Unit Price: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(price).toLocaleString('en-IN')}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {stock <= 5 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: stock === 0 ? '#dc2626' : '#d97706',
                  background: stock === 0 ? '#fee2e2' : '#fef3c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {stock === 0 ? 'Out of Stock' : `Only ${stock} left`}
              </span>
            )}
          </div>
        </div>

        {/* Total Price & Quantity Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.02em',
            }}
          >
            ₹{itemTotal.toLocaleString('en-IN')}
          </span>

          {/* Quantity selector [-] 2 [+] */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#f9f9fb',
              }}
            >
              <button
                type="button"
                id={`decrease-qty-btn-${_id}`}
                onClick={handleDecrement}
                disabled={isLoading || quantity <= 1}
                style={{
                  padding: '0.45rem 0.65rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: isLoading || quantity <= 1 ? 'not-allowed' : 'pointer',
                  color: quantity <= 1 ? 'var(--grey-400)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={quantity <= 1 ? "Minimum quantity reached (use Remove button to delete)" : "Decrease quantity"}
              >
                <Minus size={14} />
              </button>

              <span
                id={`cart-item-qty-${_id}`}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  minWidth: '36px',
                  textAlign: 'center',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  borderLeft: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                }}
              >
                {isLoading ? <Loader2 size={14} className="spin" style={{ margin: '0 auto' }} /> : quantity}
              </span>

              <button
                type="button"
                id={`increase-qty-btn-${_id}`}
                onClick={handleIncrement}
                disabled={isLoading || quantity >= stock}
                style={{
                  padding: '0.45rem 0.65rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: isLoading || quantity >= stock ? 'not-allowed' : 'pointer',
                  color: quantity >= stock ? 'var(--grey-400)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={quantity >= stock ? `Cannot exceed available stock (${stock})` : "Increase quantity"}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Remove button */}
            <button
              type="button"
              id={`remove-cart-item-btn-${_id}`}
              onClick={handleRemove}
              disabled={isLoading}
              className="btn btn-ghost"
              style={{
                color: '#ef4444',
                padding: '0.45rem 0.65rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
              title="Remove product from cart"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline item error notice */}
      {itemError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.75rem',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={14} />
          <span>{itemError}</span>
        </div>
      )}
    </div>
  );
};

export default CartItem;
