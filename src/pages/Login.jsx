import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle2, ShoppingBag, Shield
} from 'lucide-react';
import { loginCustomer, getMe } from '../services/api';

/* ── Decorative left panel ─────────────────────────── */
const LeftPanel = () => (
  <div className="auth-left" aria-hidden="true" style={{ background: '#09090b', padding: '3.5rem', color: '#fff' }}>
    {/* Radial orange glow accent */}
    <div style={{
      position: 'absolute', top: '-100px', left: '-100px',
      width: '450px', height: '450px',
      background: 'radial-gradient(circle, rgba(255, 87, 34, 0.22) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />

    {/* Floating marketplace stat pill */}
    <div style={{
      position: 'absolute',
      top: '15%', right: '10%',
      background: 'rgba(18, 18, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      padding: '1.1rem 1.35rem',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      border: '1px solid #27272a',
      width: '180px',
    }}>
      <div style={{
        width: '42px', height: '42px',
        background: 'var(--primary)',
        borderRadius: '12px',
        marginBottom: '0.65rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(255, 87, 34, 0.4)',
      }}>
        <Shield size={22} color="#fff" />
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--grey-400)', fontWeight: 600 }}>INSTANT ACCESS</p>
      <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>Verified Session</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.2rem' }}>⚡ Fast & Encrypted</p>
    </div>

    {/* Brand + hero text */}
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,87,34,0.4)' }}>
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
        ENTER THE
        <br />MARKET<span style={{ color: 'var(--primary)' }}>.</span>
      </h2>

      <p style={{ fontSize: '0.95rem', color: 'var(--grey-400)', maxWidth: '280px', lineHeight: 1.6 }}>
        Your curated catalog, trending drops, and exclusive deals waiting for you.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
        {['🔥 CURATED DROPS', '⚡ SECURE JWT', '🛡️ HTTPONLY COOKIE'].map((label) => (
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

/* ── Login Component ───────────────────────────────── */
const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState('');

  useEffect(() => {
    if (location.state?.justRegistered) {
      setRegistrationNotice('Account created successfully! Please sign in.');
      if (location.state.registeredEmail) {
        setFormData((prev) => ({ ...prev, email: location.state.registeredEmail }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginCustomer({ email: formData.email.trim().toLowerCase(), password: formData.password });
      try {
        const meData = await getMe();
        if (onLoginSuccess) onLoginSuccess(meData);
      } catch {
        if (onLoginSuccess) onLoginSuccess({ email: formData.email });
      }
      navigate('/home');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid Credentials');
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
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Sign in
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter your email and password to access your account.
            </p>
          </div>

          {/* Alerts */}
          {registrationNotice && (
            <div className="alert-banner success" id="login-registered-notice">
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{registrationNotice}</span>
            </div>
          )}
          {serverError && (
            <div className="alert-banner error" id="login-error-banner">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="input-container">
                <span className="input-icon"><Mail size={17} /></span>
                <input id="login-email" name="email" type="email" autoComplete="email"
                  className={`input-field${errors.email ? ' input-error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} disabled={isLoading} />
              </div>
              {errors.email && <span className="field-error-msg"><AlertCircle size={12} />{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                <span>Password</span>
              </label>
              <div className="input-container">
                <span className="input-icon"><Lock size={17} /></span>
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field${errors.password ? ' input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange} disabled={isLoading} />
                <button type="button" className="icon-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error-msg"><AlertCircle size={12} />{errors.password}</span>}
            </div>

            {/* Submit */}
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" id="login-submit-btn" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner" />Signing in…</>
                ) : (
                  <>Sign In <ArrowRight size={17} /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider">or</div>

          {/* Footer link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New to ShopKart?{' '}
            <Link to="/register" id="link-to-register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
