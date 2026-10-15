import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingBag, Clock, CheckCircle2, Truck, XCircle,
  ChevronRight, RefreshCw, AlertTriangle, CreditCard, MapPin
} from 'lucide-react';
import { getUserOrders } from '../services/api';

const statusConfig = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: Clock,
  },
  PLACED: {
    label: 'Placed',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#93c5fd',
    icon: CheckCircle2,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    icon: CheckCircle2,
  },
  SHIPPED: {
    label: 'Shipped',
    color: '#06b6d4',
    bg: '#ecfeff',
    border: '#67e8f9',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    icon: Package,
  },
  FAILED: {
    label: 'Failed',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fca5a5',
    icon: XCircle,
  },
};

const Orders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  // Unauthenticated
  if (!user) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem', textAlign: 'center', maxWidth: '540px', margin: '0 auto', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Package size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sign In to View Orders</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please sign in to see your order history.</p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>Sign In</Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '5rem 2rem',
            border: '1px solid var(--border-light)', gap: '1.25rem', maxWidth: '600px', margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '42px', height: '42px', borderWidth: '3.5px',
              borderColor: 'var(--primary-soft)', borderTopColor: 'var(--primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', borderStyle: 'solid',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            background: '#ffffff', border: '1.5px solid var(--error-border)', borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem', textAlign: 'center', maxWidth: '540px', margin: '0 auto',
          }}
        >
          <AlertTriangle size={40} style={{ color: 'var(--error)', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Load Orders</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty
  if (orders.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)',
            padding: '5rem 2rem', textAlign: 'center', maxWidth: '560px', margin: '0 auto', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>No Orders Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1.75rem', fontWeight: 700 }}
          >
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Package size={26} style={{ color: 'var(--primary)' }} /> My Orders
              <span style={{ fontSize: '1rem', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                {orders.length}
              </span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Track and manage all your purchases.
            </p>
          </div>
          <Link to="/products" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px' }}>
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.PENDING_PAYMENT;
            const StatusIcon = config.icon;
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            });
            const formattedTime = orderDate.toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit'
            });

            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem 1.75rem',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top row: Order ID + Status + Arrow */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: config.bg, color: config.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        <StatusIcon size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {formattedDate} at {formattedTime}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: config.color,
                          background: config.bg,
                          border: `1px solid ${config.border}`,
                        }}
                      >
                        {config.label}
                      </span>
                      <ChevronRight size={18} style={{ color: 'var(--grey-400)' }} />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-soft)', overflow: 'hidden', border: '1px solid var(--border-light)', flexShrink: 0,
                        }}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div
                        style={{
                          width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-soft)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                          fontWeight: 800, color: 'var(--primary)', flexShrink: 0,
                        }}
                      >
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: item count + total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShoppingBag size={14} /> {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CreditCard size={14} /> {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                      </span>
                      {order.shippingAddress && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} /> {order.shippingAddress.city}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
