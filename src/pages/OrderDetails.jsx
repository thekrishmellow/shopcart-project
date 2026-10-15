import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Package, ArrowLeft, Clock, CheckCircle2, Truck, XCircle,
  MapPin, CreditCard, Calendar, RefreshCw, AlertTriangle, ShoppingBag
} from 'lucide-react';
import { getOrderById } from '../services/api';

const statusConfig = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: Clock },
  PLACED: { label: 'Order Placed', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', icon: CheckCircle2 },
  CONFIRMED: { label: 'Confirmed', color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', icon: CheckCircle2 },
  SHIPPED: { label: 'Shipped', color: '#06b6d4', bg: '#ecfeff', border: '#67e8f9', icon: Truck },
  DELIVERED: { label: 'Delivered', color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', icon: Package },
  FAILED: { label: 'Failed', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: XCircle },
};

const paymentStatusConfig = {
  PENDING: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  PAID: { label: 'Paid', color: '#10b981', bg: '#ecfdf5' },
  FAILED: { label: 'Failed', color: '#ef4444', bg: '#fef2f2' },
};

const OrderDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [user, id]);

  if (!user) return null;

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
              width: '42px', height: '42px', borderStyle: 'solid', borderWidth: '3.5px',
              borderColor: 'var(--primary-soft)', borderTopColor: 'var(--primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>Loading order details...</p>
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={fetchOrder} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} /> Retry
            </button>
            <Link to="/orders" className="btn btn-ghost">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const config = statusConfig[order.status] || statusConfig.PENDING_PAYMENT;
  const payConfig = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;
  const StatusIcon = config.icon;
  const orderDate = new Date(order.createdAt);

  const timelineSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = timelineSteps.indexOf(order.status);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>

      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Package size={26} style={{ color: 'var(--primary)' }} />
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Placed on {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Link to="/orders" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> All Orders
          </Link>
        </div>
      </div>

      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 380px)', gap: '2rem', alignItems: 'start' }}
          className="order-detail-layout"
        >
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Status Card */}
            <div
              style={{
                background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)',
                padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: config.bg, color: config.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <StatusIcon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{config.label}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {order.status === 'PLACED' && 'Your order has been placed successfully.'}
                    {order.status === 'CONFIRMED' && 'Your order has been confirmed and is being processed.'}
                    {order.status === 'SHIPPED' && 'Your order is on its way!'}
                    {order.status === 'DELIVERED' && 'Your order has been delivered.'}
                    {order.status === 'FAILED' && 'This order could not be completed.'}
                    {order.status === 'PENDING_PAYMENT' && 'Awaiting payment confirmation.'}
                  </p>
                </div>
              </div>

              {/* Progress Timeline */}
              {order.status !== 'FAILED' && order.status !== 'PENDING_PAYMENT' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  {timelineSteps.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const stepConfig = statusConfig[step];
                    return (
                      <React.Fragment key={step}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: '0 0 auto' }}>
                          <div
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: isActive ? 'var(--primary)' : 'var(--bg-soft)',
                              color: isActive ? '#fff' : 'var(--grey-400)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 800,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {isActive ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', maxWidth: '60px' }}>
                            {stepConfig.label}
                          </span>
                        </div>
                        {idx < timelineSteps.length - 1 && (
                          <div
                            style={{
                              flex: 1, height: '3px', borderRadius: '2px',
                              background: idx < currentStepIndex ? 'var(--primary)' : 'var(--border-light)',
                              margin: '0 0.25rem', marginBottom: '1.5rem',
                              transition: 'background 0.3s ease',
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items */}
            <div
              style={{
                background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)',
                padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={18} style={{ color: 'var(--primary)' }} /> Order Items ({order.items.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', gap: '1rem', alignItems: 'center',
                      padding: '0.85rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div
                      style={{
                        width: '56px', height: '56px', borderRadius: 'var(--radius-sm)',
                        background: '#ffffff', overflow: 'hidden', flexShrink: 0,
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '90px' }}>

            {/* Payment Summary */}
            <div
              style={{
                background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)',
                padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{
                fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <CreditCard size={18} style={{ color: 'var(--primary)' }} /> Payment Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                  <span style={{ fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status</span>
                  <span
                    style={{
                      fontWeight: 700, fontSize: '0.78rem', padding: '0.15rem 0.65rem',
                      borderRadius: 'var(--radius-full)', color: payConfig.color, background: payConfig.bg,
                    }}
                  >
                    {payConfig.label}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1.5px dashed var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total Paid</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div
                style={{
                  background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)',
                  padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{
                  fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <MapPin size={18} style={{ color: 'var(--primary)' }} /> Delivery Address
                </h3>

                <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {order.shippingAddress.fullName}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress.addressLine1}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </p>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    📞 {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Order Info */}
            <div
              style={{
                background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)',
                padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Order Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.78rem' }}>{order._id.slice(-12).toUpperCase()}</span>
                </div>
                {order.razorpayOrderId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Razorpay Order</span>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.razorpayOrderId.slice(-12)}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment ID</span>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.razorpayPaymentId.slice(-12)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
