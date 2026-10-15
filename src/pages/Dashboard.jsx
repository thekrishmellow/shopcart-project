import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, ShoppingCart, Package,
  Star, TrendingUp, ShieldCheck, CheckCircle2,
  LogOut, Clock, ArrowRight, Lock, KeyRound, AlertCircle
} from 'lucide-react';
import { getMe, logoutCustomer } from '../services/api';

/* ── Small Stat Widget ──────────────────────────────── */
const DashboardStat = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    background: bg || '#ffffff',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{
      width: '46px', height: '46px',
      background: color ? color + '15' : 'var(--primary-soft)',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={22} color={color || 'var(--primary)'} />
    </div>
    <div>
      <p style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
    </div>
  </div>
);

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(user || null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, settings

  useEffect(() => {
    let isMounted = true;
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await getMe();
        if (isMounted) {
          setCustomer(data);
          if (setUser) setUser(data);
        }
      } catch (err) {
        if (isMounted) {
          if (setUser) setUser(null);
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCustomer();
    return () => { isMounted = false; };
  }, [navigate, setUser]);

  const handleLogout = async () => {
    try { await logoutCustomer(); } catch {}
    if (setUser) setUser(null);
    setCustomer(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', gap: '1rem' }}>
        <div className="spinner spinner-dark" style={{ width: '36px', height: '36px', borderWidth: '3.5px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600 }}>Loading your account dashboard...</p>
      </div>
    );
  }

  if (!customer) return null;

  const firstName = customer.fullName?.split(' ')[0] || 'User';

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      
      {/* ── Dashboard Top Header ── */}
      <section style={{
        background: '#09090b',
        color: '#ffffff',
        padding: '3rem 1.5rem 2.5rem',
        borderBottom: '1px solid #27272a',
        marginBottom: '2rem',
      }}>
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-orange" style={{ marginBottom: '0.65rem' }}>
                <ShieldCheck size={13} /> CUSTOMER ACCOUNT DASHBOARD
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#ffffff', lineHeight: 1.1 }}>
                Welcome, <span style={{ color: 'var(--primary)' }}>{firstName}</span>!
              </h1>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Manage your active cart, purchases, rewards, and personal details.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-primary-pill" style={{ padding: '0.7rem 1.4rem' }}>
                <ShoppingCart size={16} /> Go to Catalog
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.7rem 1.25rem' }}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Workspace ── */}
      <div className="page-container">
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
        }}>
          {[
            { id: 'overview', label: 'Overview & Cart' },
            { id: 'orders', label: 'Purchase History' },
            { id: 'profile', label: 'Profile & Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: 'var(--radius-full)',
                border: activeTab === tab.id ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                background: activeTab === tab.id ? 'var(--primary-soft)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW & CART ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Widgets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <DashboardStat icon={ShoppingCart} label="Active Cart Items" value="0" color="var(--primary)" />
              <DashboardStat icon={Package} label="Completed Purchases" value="0" color="#10b981" />
              <DashboardStat icon={Star} label="Prime Rewards" value="250 pts" color="#f59e0b" />
              <DashboardStat icon={TrendingUp} label="Store Credits" value="₹0.00" color="#ec4899" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              
              {/* Active Cart Summary Card */}
              <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={20} color="var(--primary)" /> Shopping Cart Summary
                  </h2>
                  <span className="badge badge-orange">Lab 04 Integration</span>
                </div>

                <div style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px border var(--border-light)',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <ShoppingCart size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Your Cart is Currently Empty
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 1.25rem' }}>
                    Browse our fullstock product catalog to add mechanical keyboards, audio gear, and fashion items to your cart.
                  </p>
                  <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
                    Browse Product Catalog <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Personal Profile Quick Card */}
              <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--primary)" /> Account Information
                  </h2>
                  <span className="badge badge-green">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.9rem 1.1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</span>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{customer.fullName}</p>
                  </div>

                  <div style={{ padding: '0.9rem 1.1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</span>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{customer.email}</p>
                  </div>

                  <div style={{ padding: '0.9rem 1.1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone Contact</span>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{customer.phone}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: PURCHASE HISTORY ── */}
        {activeTab === 'orders' && (
          <div className="card" style={{ padding: '2.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Purchase & Order History
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Track your previous orders and delivery status.
                </p>
              </div>
              <span className="badge badge-black">0 Orders Total</span>
            </div>

            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
            }}>
              <Package size={42} color="var(--grey-400)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No Past Purchases Found
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                You haven't placed any orders yet. Explore our product catalog to make your first purchase!
              </p>
              <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.7rem 1.5rem' }}>
                Start Shopping Now
              </Link>
            </div>
          </div>
        )}

        {/* ── TAB 3: PROFILE & SECURITY ── */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2.5rem', background: '#ffffff' }}>
              <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Account & Security Settings
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Your personal profile data stored in ShopKart MongoDB ecosystem.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" value={customer.fullName} disabled className="input-field" style={{ background: 'var(--bg-soft)', marginTop: '0.35rem' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
                  <input type="email" value={customer.email} disabled className="input-field" style={{ background: 'var(--bg-soft)', marginTop: '0.35rem' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="text" value={customer.phone} disabled className="input-field" style={{ background: 'var(--bg-soft)', marginTop: '0.35rem' }} />
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}>
                <LogOut size={16} /> Sign Out Of Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
