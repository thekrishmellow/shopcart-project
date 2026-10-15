import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, ShoppingCart, Package,
  Star, TrendingUp, ChevronRight, ArrowUpRight,
  Shield, CheckCircle2, Zap, Tag, LogOut, Sparkles,
  Truck, RotateCcw, ShieldCheck, ArrowRight, Eye
} from 'lucide-react';
import { getMe, logoutCustomer, getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

/* ── USP Feature Bar Item ────────────────────────────── */
const UspItem = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem' }}>
    <div style={{
      width: '42px', height: '42px',
      borderRadius: '12px',
      background: 'var(--primary-soft)',
      color: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: '1px solid var(--primary-mid)',
    }}>
      <Icon size={20} />
    </div>
    <div>
      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{desc}</p>
    </div>
  </div>
);

/* ── Category Collection Card ────────────────────────── */
const CategoryCollectionCard = ({ title, categoryKey, image, count, emoji, onClick }) => (
  <div
    className="card card-hover"
    onClick={onClick}
    style={{
      position: 'relative',
      height: '240px',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid var(--border-light)',
    }}
  >
    <img
      src={image}
      alt={title}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.4s ease',
      }}
      className="product-card-img"
    />
    {/* Dark Overlay gradient */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.3) 60%, transparent 100%)',
    }} />

    {/* Content */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '1.35rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      color: '#ffffff',
    }}>
      <div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {emoji} COLLECTION
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.15rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--grey-400)', marginTop: '0.2rem' }}>
          Explore curated drops
        </p>
      </div>

      <div style={{
        width: '36px', height: '36px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(255,87,34,0.4)',
      }}>
        <ArrowUpRight size={18} />
      </div>
    </div>
  </div>
);

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(user || null);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch current user session (optional for home landing)
        try {
          const userData = await getMe();
          if (isMounted) {
            setCustomer(userData);
            if (setUser) setUser(userData);
          }
        } catch {
          if (isMounted) {
            setCustomer(null);
            if (setUser) setUser(null);
          }
        }

        // Fetch top featured products from database
        const prodData = await getProducts();
        if (isMounted && prodData.products) {
          setFeaturedProducts(prodData.products.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPageData();
    return () => { isMounted = false; };
  }, [setUser]);

  const handleLogout = async () => {
    try { await logoutCustomer(); } catch {}
    if (setUser) setUser(null);
    setCustomer(null);
    navigate('/login');
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* ── 1. Announcement Marquee Bar ── */}
      <div style={{
        background: 'var(--primary)',
        color: '#ffffff',
        padding: '0.45rem 1rem',
        fontSize: '0.78rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}>
        <span>⚡ FLASH DROP: FREE EXPRESS DELIVERY ON ORDERS OVER ₹999</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>🔥 100% AUTHENTIC GUARANTEE</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>USE CODE: DROP50 FOR 20% OFF</span>
      </div>

      {/* ── 2. Hero Section (25% Black + 20% Orange Accent) ── */}
      <section style={{
        background: '#09090b',
        color: '#ffffff',
        padding: '4.5rem 1.5rem 4rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #27272a',
      }}>
        {/* Radial Orange Glow */}
        <div style={{
          position: 'absolute', right: '-60px', top: '-60px',
          width: '550px', height: '550px',
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.28) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.25fr) minmax(280px, 1fr)', gap: '3rem', alignItems: 'center' }} className="search-filter-grid">
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="badge badge-orange" style={{ background: 'rgba(255,87,34,0.18)', border: '1px solid rgba(255,87,34,0.35)', color: 'var(--primary)' }}>
                  <Zap size={13} /> SEASON 2026 DROPS
                </span>
                <span className="badge badge-black" style={{ background: '#18181b', color: '#fff', border: '1px solid #27272a' }}>
                  <ShieldCheck size={13} /> VERIFIED MARKETPLACE
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3.4rem',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 1.05,
                color: '#ffffff',
                marginBottom: '1rem',
              }}>
                THE NEXT-GEN<br />
                <span style={{ color: 'var(--primary)' }}>MARKETPLACE.</span>
              </h1>

              <p style={{ color: 'var(--grey-400)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '2rem' }}>
                Browse curated tech, mechanical keyboards, premium audio, and lifestyle gear — directly connected to live MongoDB inventory.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-primary-pill"
                  style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}
                >
                  <ShoppingCart size={18} /> Explore Catalog
                </button>
                {!customer ? (
                  <Link
                    to="/register"
                    className="btn btn-outline"
                    style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', background: 'rgba(255,255,255,0.05)', borderColor: '#3f3f46', color: '#ffffff' }}
                  >
                    Join ShopKart <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    onClick={() => navigate('/products')}
                    className="btn btn-outline"
                    style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', background: 'rgba(255,255,255,0.05)', borderColor: '#3f3f46', color: '#ffffff' }}
                  >
                    View Drops <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Showcase Card */}
            <div style={{
              background: 'rgba(18, 18, 23, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #27272a',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-dark)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔥 HOT PICK OF THE WEEK
                </span>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>★ 4.9 Rating</span>
              </div>

              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem', position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  alt="Headphones"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                Noise Cancelling Headphones
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--grey-400)', marginBottom: '1rem' }}>
                Wireless over-ear headphones with active noise cancellation & 40h battery.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid #27272a' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--grey-400)', textTransform: 'uppercase' }}>Member Price</span>
                  <p style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>₹4,999</p>
                </div>

                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', width: 'auto' }}
                >
                  <Eye size={14} /> View Drop
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Trust & Value Proposition Bar ── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '1rem 0' }}>
        <div className="page-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            <UspItem icon={Truck} title="Fast Express Delivery" desc="Free shipping on orders ₹999+" />
            <UspItem icon={ShieldCheck} title="100% Authentic" desc="Direct from verified brands" />
            <UspItem icon={RotateCcw} title="Easy 7-Day Returns" desc="Hassle-free instant refund" />
            <UspItem icon={Sparkles} title="100,000+ Happy Shoppers" desc="Rated 4.9/5 by customers" />
          </div>
        </div>
      </section>

      {/* ── 4. Featured Category Collections ── */}
      <section className="page-container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURATED COLLECTIONS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Shop By Category
            </h2>
          </div>

          <Link to="/products" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View All Categories <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          <CategoryCollectionCard
            title="Electronics & Tech"
            emoji="⚡"
            image="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
            onClick={() => navigate('/products?category=Electronics')}
          />
          <CategoryCollectionCard
            title="Streetwear & Apparel"
            emoji="👗"
            image="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
            onClick={() => navigate('/products?category=Fashion')}
          />
          <CategoryCollectionCard
            title="Tech & Design Books"
            emoji="📚"
            image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            onClick={() => navigate('/products?category=Books')}
          />
          <CategoryCollectionCard
            title="Home & Lifestyle"
            emoji="🏡"
            image="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
            onClick={() => navigate('/products?category=Home')}
          />
        </div>
      </section>

      {/* ── 5. Live Trending Products Section ── */}
      {featuredProducts.length > 0 && (
        <section className="page-container" style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-orange" style={{ marginBottom: '0.4rem' }}>
                🔥 LIVE INVENTORY DROPS
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Trending Right Now
              </h2>
            </div>

            <Link to="/products" className="btn btn-outline" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
              Explore Full Catalog ({featuredProducts.length}+ items)
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Logged In Profile / Loyalty Status Card ── */}
      {customer && (
        <section className="page-container" style={{ marginTop: '4rem' }}>
          <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '1.5px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '0.4rem' }}>
                  <CheckCircle2 size={12} /> VERIFIED CUSTOMER PROFILE
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Welcome back, {customer.fullName}!
                </h3>
              </div>

              <button onClick={handleLogout} className="btn btn-danger" style={{ fontSize: '0.82rem' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Account Name</span>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{customer.fullName}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</span>
                <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{customer.email}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone Contact</span>
                <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{customer.phone}</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--primary-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-mid)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Prime Rewards</span>
                <p style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.1rem' }}>250 Points</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Marketplace Footer ── */}
      <footer style={{ background: '#09090b', color: '#ffffff', marginTop: '5rem', paddingTop: '4rem', paddingBottom: '2.5rem', borderTop: '1px solid #27272a' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
            
            {/* Col 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={18} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: '#ffffff' }}>
                  SHOP<span style={{ color: 'var(--primary)' }}>KART</span>
                </span>
              </div>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '260px' }}>
                The next-gen fullstack marketplace for curated products, tech drops, and exclusive deals.
              </p>
            </div>

            {/* Col 2: Shop Links */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--grey-400)' }}>
                <li><Link to="/products" style={{ color: 'var(--grey-400)' }}>All Products</Link></li>
                <li><Link to="/products?category=Electronics" style={{ color: 'var(--grey-400)' }}>Electronics</Link></li>
                <li><Link to="/products?category=Fashion" style={{ color: 'var(--grey-400)' }}>Streetwear</Link></li>
                <li><Link to="/products?category=Books" style={{ color: 'var(--grey-400)' }}>Books & Media</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Care */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
                Customer Care
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--grey-400)' }}>
                <li><a href="#" style={{ color: 'var(--grey-400)' }}>Help Center & FAQ</a></li>
                <li><a href="#" style={{ color: 'var(--grey-400)' }}>Track Order</a></li>
                <li><a href="#" style={{ color: 'var(--grey-400)' }}>Returns Policy</a></li>
                <li><a href="#" style={{ color: 'var(--grey-400)' }}>Privacy & Terms</a></li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
                Stay In The Loop
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--grey-400)', marginBottom: '0.85rem' }}>
                Subscribe for exclusive drop notifications & promo codes.
              </p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="email"
                  placeholder="Enter email..."
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #27272a',
                    background: '#121217',
                    color: '#fff',
                    fontSize: '0.85rem',
                    flex: 1,
                    outline: 'none',
                  }}
                />
                <button className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', width: 'auto' }}>
                  Join
                </button>
              </div>
            </div>

          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid #27272a', textAlign: 'center', fontSize: '0.78rem', color: 'var(--grey-500)' }}>
            © {new Date().getFullYear()} ShopKart Inc. All rights reserved. Fullstack MERN Engineering Lab Ecosystem.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
