import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw,
  CheckCircle2, AlertTriangle, XCircle, Star, Heart, Share2,
  Tag, Box, Zap, Loader2
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getItemQuantity, itemLoadingMap } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [cartToastMsg, setCartToastMsg] = useState(null);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null);

  const isAddingCart = !!itemLoadingMap[id];

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data.product || data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setError('Product not found.');
          } else if (err.response && err.response.status === 400) {
            setError('Invalid product ID.');
          } else {
            setError('Something went wrong while loading product details.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = async () => {
    if (isAddingCart) return;

    try {
      setCartToastMsg(null);
      // 1. Add item to cart
      const res = await addToCart(id);
      if (!res.success) {
        setCartToastMsg(res.message);
        return;
      }

      // 2. If user selected quantity > 1, update item quantity
      if (quantity > 1) {
        const currentQty = getItemQuantity(id);
        const targetQty = Math.max(currentQty, quantity);
        await updateQuantity(id, targetQty);
      }

      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setCartToastMsg('Failed to add product to cart.');
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    try {
      setWishlistLoading(true);
      if (wishlistSaved) {
        await removeFromWishlist(id);
        setWishlistSaved(false);
        setWishlistToast('Removed from Wishlist');
      } else {
        await addToWishlist(id);
        setWishlistSaved(true);
        setWishlistToast('Added to Wishlist!');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setWishlistToast('Please sign in to save products');
      } else if (err.response?.status === 409) {
        setWishlistSaved(true);
        setWishlistToast('Already in Wishlist');
      } else {
        setWishlistToast('Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishlistToast(null), 3000);
    }
  };

  /* ── 1. Loading State ── */
  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
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
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  /* ── 2. Error / Not Found State ── */
  if (error || !product) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          className="page-container"
          style={{
            background: '#fff',
            border: '1.5px solid var(--error-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
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
            {error || 'Product Not Found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
            The product you are looking for might have been removed or does not exist.
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.7rem 1.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      
      {/* ── Breadcrumb & Back Nav ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '1rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/home" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>/</span>
            <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link>
            <span>/</span>
            <Link to={`/products?category=${encodeURIComponent(category)}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{category}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </span>
          </div>

          <Link
            to="/products"
            id="back-to-products-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={15} /> Back to All Products
          </Link>
        </div>
      </div>

      {/* ── Toast Alert for Add to Cart ── */}
      {addedToast && (
        <div
          style={{
            position: 'fixed',
            top: '85px',
            right: '25px',
            zIndex: 9999,
            background: 'var(--text-primary)',
            color: '#fff',
            padding: '1rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ background: 'var(--success)', borderRadius: '50%', padding: '3px', display: 'flex' }}>
            <CheckCircle2 size={16} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>Added to Cart!</p>
            <p style={{ fontSize: '0.78rem', color: '#ccc' }}>{quantity} unit{quantity > 1 ? 's' : ''} of {name} added to your cart</p>
          </div>
        </div>
      )}

      {/* ── Main Product Display Grid ── */}
      <div className="page-container" style={{ marginTop: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) minmax(340px, 1.25fr)',
            gap: '3rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
          className="product-details-grid"
        >
          {/* Left Column: Large Product Image */}
          <div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '90%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#f6f6fb',
                border: '1px solid var(--border-light)',
              }}
            >
              <img
                src={image}
                alt={name}
                id="product-detail-image"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Value Props Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '1.5rem',
              }}
            >
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                <Truck size={18} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>Free Delivery</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Orders over ₹499</p>
              </div>

              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                <ShieldCheck size={18} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>1 Year Warranty</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>100% Authentic</p>
              </div>

              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                <RotateCcw size={18} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>7-Day Returns</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hassle-free policy</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Metadata & Buy Box */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <span
                  id="product-detail-category"
                  className="badge badge-purple"
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                  }}
                >
                  {category}
                </span>

                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <strong style={{ color: 'var(--text-primary)' }}>4.8</strong> (142 reviews)
                </span>
              </div>

              {/* Title */}
              <h1
                id="product-detail-name"
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                  marginBottom: '1rem',
                }}
              >
                {name}
              </h1>

              {/* Price Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--primary-soft)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--primary-mid)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Special Price:</span>
                <span
                  id="product-detail-price"
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{Math.round(price * 1.25).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  20% OFF
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Description
                </h4>
                <p
                  id="product-detail-description"
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {description}
                </p>
              </div>

              {/* Stock Status Indicator */}
              <div
                id="product-detail-stock"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#f0fdf4',
                  border: `1px solid ${isOutOfStock ? '#fca5a5' : isLowStock ? '#fde68a' : '#bbf7d0'}`,
                }}
              >
                {isOutOfStock ? (
                  <>
                    <XCircle size={18} color="#dc2626" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>
                      Currently Out of Stock (0 units available)
                    </span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle size={18} color="#d97706" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#d97706' }}>
                      Hurry, only {stock} unit{stock === 1 ? '' : 's'} left in stock!
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#16a34a' }}>
                      In Stock ({stock} units available)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Action */}
            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Quantity buttons */}
                {!isOutOfStock && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--bg-page)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                      }}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.75rem 0.5rem', fontWeight: 700, fontSize: '0.95rem', minWidth: '32px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                      }}
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingCart}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    opacity: isOutOfStock || isAddingCart ? 0.6 : 1,
                    cursor: isOutOfStock || isAddingCart ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isAddingCart ? (
                    <>
                      <Loader2 size={19} className="spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={19} />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  id="product-detail-wishlist-btn"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="btn"
                  style={{
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: wishlistSaved ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-page)',
                    color: wishlistSaved ? '#ef4444' : 'var(--text-secondary)',
                    border: `1.5px solid ${wishlistSaved ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-light)'}`,
                    cursor: wishlistLoading ? 'not-allowed' : 'pointer',
                  }}
                  title={wishlistSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={19} fill={wishlistSaved ? '#ef4444' : 'none'} color={wishlistSaved ? '#ef4444' : 'var(--text-secondary)'} />
                  {wishlistLoading ? 'Saving...' : wishlistSaved ? '♥ Wishlisted' : '♡ Wishlist'}
                </button>
              </div>

              {wishlistToast && (
                <p style={{ fontSize: '0.85rem', color: wishlistSaved ? 'var(--success-text)' : '#ef4444', fontWeight: 600, marginTop: '0.5rem', textAlign: 'center' }}>
                  {wishlistToast}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
