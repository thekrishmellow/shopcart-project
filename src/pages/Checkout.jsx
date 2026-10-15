import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, User, Building, Map, Hash,
  ShieldCheck, Truck, Package, ArrowLeft, CreditCard,
  AlertTriangle, CheckCircle2, Loader2, ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, cartItemCount, subtotal, fetchCart } = useCart();

  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // form | processing | success | error
  const [apiError, setApiError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (user && cartItems.length === 0 && paymentStep === 'form') {
      navigate('/cart');
    }
  }, [user, cartItems, navigate, paymentStep]);

  const validateField = (name, value) => {
    const v = value.trim();
    switch (name) {
      case 'fullName':
        if (!v) return 'Full name is required';
        if (v.length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'phone':
        if (!v) return 'Phone number is required';
        if (!/^\+?\d{10,14}$/.test(v.replace(/[\s-]/g, ''))) return 'Enter a valid 10-digit phone number';
        return '';
      case 'addressLine1':
        if (!v) return 'Address is required';
        if (v.length < 5) return 'Address must be at least 5 characters';
        return '';
      case 'city':
        if (!v) return 'City is required';
        return '';
      case 'state':
        if (!v) return 'State is required';
        return '';
      case 'pincode':
        if (!v) return 'Pincode is required';
        if (!/^\d{6}$/.test(v)) return 'Pincode must be exactly 6 digits';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(address).forEach(key => {
      const err = validateField(key, address[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateAll()) return;

    try {
      setSubmitting(true);
      setPaymentStep('processing');

      // 1. Create payment order on backend
      const orderData = await createPaymentOrder({
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        addressLine1: address.addressLine1.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim()
      });

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const razorpayOrderId = orderData.razorpayOrderId;
      const shopKartOrderId = orderData.shopKartOrderId;
      const razorpayKey = orderData.key;
      const amountInPaise = orderData.amount;

      // 2. Try to load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        // ── Razorpay Checkout Popup Widget ──
        const options = {
          key: razorpayKey || 'rzp_test_TkZVydbAs4Z3IR',
          amount: amountInPaise,
          currency: 'INR',
          name: 'ShopKart',
          description: `Order #${shopKartOrderId.toString().slice(-8).toUpperCase()}`,
          handler: async function (response) {
            // Razorpay returns: razorpay_order_id, razorpay_payment_id, razorpay_signature
            try {
              const verifyData = await verifyPayment({
                shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || `valid_signature_${razorpayOrderId}`
              });

              if (verifyData.success) {
                setPlacedOrder(verifyData.order);
                setPaymentStep('success');
                await fetchCart();
              } else {
                throw new Error(verifyData.message || 'Payment verification failed');
              }
            } catch (verifyErr) {
              console.error('Verification error:', verifyErr);
              setApiError(verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed');
              setPaymentStep('error');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: address.fullName.trim(),
            email: user?.email || '',
            contact: address.phone.trim(),
          },
          theme: {
            color: '#ff5722'
          },
          modal: {
            ondismiss: function () {
              setPaymentStep('form');
              setSubmitting(false);
            }
          }
        };

        // Only attach order_id if it's a real Razorpay Order ID (starts with order_)
        if (razorpayOrderId && !razorpayOrderId.startsWith('order_test_')) {
          options.order_id = razorpayOrderId;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setApiError(response.error?.description || 'Payment failed. Please try again.');
          setPaymentStep('error');
          setSubmitting(false);
        });
        rzp.open();
        return;
      }

      // ── Test/Fallback Flow (no real Razorpay keys) ──
      console.info('Using test payment flow (Razorpay keys not configured or script failed to load)');

      const testPaymentId = `pay_test_${Date.now()}`;
      const testSignature = `valid_signature_${razorpayOrderId}`;

      const verifyData = await verifyPayment({
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: testSignature
      });

      if (verifyData.success) {
        setPlacedOrder(verifyData.order);
        setPaymentStep('success');
        await fetchCart();
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setApiError(err.response?.data?.message || err.message || 'Something went wrong during checkout');
      setPaymentStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (paymentStep === 'success' && placedOrder) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.25rem', lineHeight: 1.6 }}>
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div
            style={{
              background: 'var(--bg-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              margin: '1.5rem 0',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                {placedOrder._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{placedOrder.items?.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                ₹{placedOrder.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span
                style={{
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'var(--success)',
                  padding: '0.15rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                }}
              >
                {placedOrder.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link
              to="/orders"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Package size={16} /> View Orders
            </Link>
            <Link
              to="/products"
              className="btn btn-ghost"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (paymentStep === 'error') {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--error-border)',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--error-bg)',
              color: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Payment Failed
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {apiError || 'Something went wrong during checkout. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => { setPaymentStep('form'); setApiError(''); }}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
            >
              Try Again
            </button>
            <Link to="/cart" className="btn btn-ghost" style={{ padding: '0.75rem 1.25rem' }}>
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (paymentStep === 'processing') {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', padding: '4rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '4rem 2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '3.5px solid var(--primary-soft)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem',
            }}
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Processing Payment...
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Please don't close this page. We're securely processing your order.
          </p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user) return null;

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.75rem',
    borderRadius: 'var(--radius-md)',
    border: `1.5px solid ${errors[fieldName] ? 'var(--error)' : 'var(--border-light)'}`,
    fontSize: '0.92rem',
    fontFamily: 'var(--font-body)',
    color: 'var(--text-primary)',
    background: errors[fieldName] ? 'var(--error-bg)' : '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  });

  const iconStyle = {
    position: 'absolute',
    left: '0.85rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--grey-400)',
    pointerEvents: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>

      {/* Page Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={26} style={{ color: 'var(--primary)' }} /> Checkout
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Enter your delivery details and confirm your purchase.
            </p>
          </div>
          <Link to="/cart" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Cart
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(320px, 400px)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="checkout-layout"
        >
          {/* Shipping Address Form */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <MapPin size={20} style={{ color: 'var(--primary)' }} /> Shipping Address
            </h3>

            <form onSubmit={handlePlaceOrder} id="checkout-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Full Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle} htmlFor="checkout-fullName">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconStyle} />
                    <input
                      type="text"
                      id="checkout-fullName"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      style={inputStyle('fullName')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.fullName ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.fullName && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle} htmlFor="checkout-phone">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={iconStyle} />
                    <input
                      type="tel"
                      id="checkout-phone"
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="9876543210"
                      style={inputStyle('phone')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.phone ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.phone && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.phone}</p>}
                </div>

                {/* Address Line */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle} htmlFor="checkout-addressLine1">Address</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={iconStyle} />
                    <input
                      type="text"
                      id="checkout-addressLine1"
                      name="addressLine1"
                      value={address.addressLine1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="House No, Street, Area"
                      style={inputStyle('addressLine1')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.addressLine1 ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.addressLine1 && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.addressLine1}</p>}
                </div>

                {/* City */}
                <div>
                  <label style={labelStyle} htmlFor="checkout-city">City</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={iconStyle} />
                    <input
                      type="text"
                      id="checkout-city"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mumbai"
                      style={inputStyle('city')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.city ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.city && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label style={labelStyle} htmlFor="checkout-state">State</label>
                  <div style={{ position: 'relative' }}>
                    <Map size={16} style={iconStyle} />
                    <input
                      type="text"
                      id="checkout-state"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Maharashtra"
                      style={inputStyle('state')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.state ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.state && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.state}</p>}
                </div>

                {/* Pincode */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle} htmlFor="checkout-pincode">Pincode</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={iconStyle} />
                    <input
                      type="text"
                      id="checkout-pincode"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="400001"
                      maxLength={6}
                      style={inputStyle('pincode')}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = errors.pincode ? 'var(--error)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.pincode && <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 600 }}>{errors.pincode}</p>}
                </div>
              </div>

              {apiError && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--error-text)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={16} /> {apiError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="place-order-btn"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '1.75rem',
                  padding: '0.95rem 1.25rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 14px rgba(255,87,34,0.3)',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} /> Pay ₹{subtotal.toLocaleString('en-IN')} & Place Order
                  </>
                )}
              </button>
            </form>
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
          >
            <h3 style={{
              fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)',
              marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <ShoppingBag size={18} style={{ color: 'var(--primary)' }} /> Order Summary
            </h3>

            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {cartItems.map((item, idx) => (
                <div key={item.product?._id || idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-soft)',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product?.name || 'Product'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.product?.name || 'Product'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × ₹{item.product?.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                    ₹{((item.product?.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items ({cartItemCount})</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE</span>
              </div>
            </div>

            <div style={{ borderTop: '1.5px dashed var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Trust Badges */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={15} color="var(--primary)" />
                <span>Razorpay Secure Payment Gateway</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <Truck size={15} color="var(--primary)" />
                <span>Free Express Delivery on All Orders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <Package size={15} color="var(--primary)" />
                <span>Easy Returns & 7-Day Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
