import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, Eye, EyeOff,
  AlertCircle, CheckCircle2, ArrowRight, ShoppingBag, Sparkles
} from 'lucide-react';
import { registerCustomer } from '../services/api';

/* ── Decorative left panel background ───────────────── */
const LeftPanel = () => (
  <div className="auth-left" aria-hidden="true" style={{ background: '#09090b', padding: '3.5rem', color: '#fff' }}>
    {/* Soft radial orange glow */}
    <div style={{
      position: 'absolute', bottom: '-100px', right: '-100px',
      width: '450px', height: '450px',
      background: 'radial-gradient(circle, rgba(255, 87, 34, 0.20) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />

    {/* Floating stat pill */}
    <div style={{
      position: 'absolute',
      top: '12%', right: '10%',
      background: 'rgba(18, 18, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      padding: '1.1rem 1.35rem',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      border: '1px solid #27272a',
      minWidth: '170px',
    }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--grey-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Join The Club</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>10k+ Members</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.15rem' }}>⚡ Exclusive Perks</p>
    </div>

    {/* Big display text */}
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'var(--primary)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(255,87,34,0.4)',
        }}>
          <ShoppingBag size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
          SHOP<span style={{ color: 'var(--primary)' }}>KART</span>
        </span>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '3rem',
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '-0.04em',
        lineHeight: 1.05,
        marginBottom: '1rem',
      }}>
        SHOP
        <br />SMARTER<span style={{ color: 'var(--primary)' }}>.</span>
      </h2>

      <p style={{ fontSize: '0.95rem', color: 'var(--grey-400)', maxWidth: '280px', lineHeight: 1.6 }}>
        Create your account to unlock curated drops, fast checkout, and member pricing.
      </p>

      {/* Feature chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
        {['⚡ FAST EXPRESS DELIVERY', '🔄 7-DAY EASY RETURNS', '💬 24/7 SUPPORT'].map((label) => (
          <span key={label} style={{
            padding: '0.35rem 0.85rem',
            background: 'rgba(255, 87, 34, 0.12)',
            border: '1px solid rgba(255, 87, 34, 0.28)',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.03em',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

/* ── Main Register Component ─────────────────────────── */
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'At least 2 characters required';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9+\s\-]{7,15}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });
      setSuccessMessage(res?.message || 'Account created! Redirecting to login…');
      setTimeout(() => navigate('/login', { state: { justRegistered: true, registeredEmail: formData.email.trim().toLowerCase() } }), 1400);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <LeftPanel />

      {/* ── Right: Form ─────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-box">
          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.85rem' }}>
              <Sparkles size={12} /> New here?
            </span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Get started with ShopKart in seconds.
            </p>
          </div>

          {/* Server alerts */}
          {serverError && (
            <div className="alert-banner error" id="register-server-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{serverError}</span>
            </div>
          )}
          {successMessage && (
            <div className="alert-banner success" id="register-success-banner">
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div className="input-container">
                <span className="input-icon"><User size={17} /></span>
                <input id="fullName" name="fullName" type="text" autoComplete="name"
                  className={`input-field${errors.fullName ? ' input-error' : ''}`}
                  placeholder="Alex Johnson"
                  value={formData.fullName} onChange={handleChange} disabled={isLoading} />
              </div>
              {errors.fullName && <span className="field-error-msg"><AlertCircle size={12} />{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-container">
                <span className="input-icon"><Mail size={17} /></span>
                <input id="email" name="email" type="email" autoComplete="email"
                  className={`input-field${errors.email ? ' input-error' : ''}`}
                  placeholder="alex@example.com"
                  value={formData.email} onChange={handleChange} disabled={isLoading} />
              </div>
              {errors.email && <span className="field-error-msg"><AlertCircle size={12} />{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <span>Password</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>min. 6 chars</span>
              </label>
              <div className="input-container">
                <span className="input-icon"><Lock size={17} /></span>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field${errors.password ? ' input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange} disabled={isLoading} />
                <button type="button" className="icon-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error-msg"><AlertCircle size={12} />{errors.password}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className="input-container">
                <span className="input-icon"><Phone size={17} /></span>
                <input id="phone" name="phone" type="tel" autoComplete="tel"
                  className={`input-field${errors.phone ? ' input-error' : ''}`}
                  placeholder="+91 98765 43210"
                  value={formData.phone} onChange={handleChange} disabled={isLoading} />
              </div>
              {errors.phone && <span className="field-error-msg"><AlertCircle size={12} />{errors.phone}</span>}
            </div>

            {/* Submit */}
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" id="register-submit-btn" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner" />Creating account…</>
                ) : (
                  <>Create Account <ArrowRight size={17} /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" id="link-to-login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
