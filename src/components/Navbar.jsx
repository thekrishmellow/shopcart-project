import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User, LogIn, ShoppingCart, ChevronDown, Heart } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, onLogout, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  const categories = ['Electronics', 'Fashion', 'Books', 'Home'];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" id="nav-brand-logo">
          <div className="navbar-logo-icon">
            <ShoppingBag size={19} />
          </div>
          <span className="navbar-brand-name">
            Shop<span>Kart</span>
            <sup style={{ fontSize: '0.55rem', fontWeight: 800, verticalAlign: 'super', marginLeft: '2px', color: 'var(--primary)' }}>PRO</sup>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav>
          <ul className="navbar-nav">
            <li>
              <Link
                to="/"
                className={location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}
                id="nav-link-home"
                style={{ color: (location.pathname === '/' || location.pathname === '/home') ? 'var(--primary)' : 'var(--grey-400)' }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={location.pathname === '/products' ? 'active' : ''}
                id="nav-link-shop"
                style={{ color: location.pathname === '/products' ? 'var(--primary)' : 'var(--grey-400)' }}
              >
                Products
              </Link>
            </li>

            <li>
              <Link
                to="/wishlist"
                className={location.pathname === '/wishlist' ? 'active' : ''}
                id="nav-link-wishlist"
                style={{
                  color: location.pathname === '/wishlist' ? '#ef4444' : 'var(--grey-400)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className={location.pathname === '/cart' ? 'active' : ''}
                id="nav-link-cart"
                style={{
                  color: location.pathname === '/cart' ? 'var(--primary)' : 'var(--grey-400)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                Cart {cartItemCount > 0 ? `(${cartItemCount})` : ''}
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to="/orders"
                  className={location.pathname.startsWith('/orders') ? 'active' : ''}
                  id="nav-link-orders"
                  style={{
                    color: location.pathname.startsWith('/orders') ? 'var(--primary)' : 'var(--grey-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  Orders
                </Link>
              </li>
            )}
            
            {/* Categories Dropdown */}
            <li
              style={{ position: 'relative' }}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: location.search.includes('category=') ? 'var(--primary)' : 'var(--grey-400)',
                  fontFamily: 'inherit',
                  padding: '0.5rem 0',
                }}
              >
                Categories
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: '#121217',
                    boxShadow: 'var(--shadow-dark)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #27272a',
                    padding: '0.5rem',
                    minWidth: '170px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <Link
                    to="/products"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.85rem',
                      color: '#ffffff',
                      fontWeight: 600,
                      display: 'block',
                    }}
                    className="dropdown-item"
                  >
                    🏷️ All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.85rem',
                        color: 'var(--grey-300)',
                        fontWeight: 500,
                        display: 'block',
                      }}
                      className="dropdown-item"
                    >
                      📦 {cat}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {user && (
              <li>
                <Link
                  to="/dashboard"
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                  id="nav-link-dashboard"
                  style={{ color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--grey-400)' }}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* User profile pill */}
              <Link
                to="/dashboard"
                id="user-profile-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem 0.35rem 0.45rem',
                  background: 'rgba(255, 87, 34, 0.12)',
                  border: '1px solid rgba(255, 87, 34, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={13} />}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName?.split(' ')[0]}
                </span>
              </Link>

              {/* Wishlist Button */}
              <button
                className="btn-ghost"
                id="navbar-wishlist-icon-btn"
                style={{ position: 'relative', borderRadius: '50%', padding: '0.55rem', border: '1px solid #27272a', background: '#121217', cursor: 'pointer' }}
                onClick={() => navigate('/wishlist')}
                title="My Wishlist"
              >
                <Heart size={18} color="#ef4444" fill={wishlistCount > 0 ? "#ef4444" : "none"} />
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px', right: '-4px',
                    width: '18px', height: '18px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                  }}>{wishlistCount}</span>
                )}
              </button>

              {/* Cart button */}
              <button
                className="btn-ghost"
                id="navbar-cart-icon-btn"
                style={{ position: 'relative', borderRadius: '50%', padding: '0.55rem', border: '1px solid #27272a', background: '#121217', cursor: 'pointer' }}
                onClick={() => navigate('/cart')}
                title="Shopping Cart"
              >
                <ShoppingCart size={18} color="#ffffff" />
                {cartItemCount > 0 && (
                  <span
                    id="navbar-cart-badge"
                    style={{
                      position: 'absolute',
                      top: '-4px', right: '-4px',
                      width: '18px', height: '18px',
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255,87,34,0.4)',
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Logout */}
              <button
                id="logout-button"
                onClick={handleLogout}
                className="btn btn-danger"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" id="nav-login-link" className="btn btn-ghost">
                <LogIn size={16} />
                Sign In
              </Link>
              <Link to="/register" id="nav-register-link" className="btn btn-primary-pill" style={{ padding: '0.55rem 1.25rem' }}>
                Join Drop
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
