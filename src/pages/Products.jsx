import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { PackageSearch, AlertCircle, RefreshCw, Sparkles, FilterX } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL query parameters if present
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialSort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Sync state when URL params change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  // Fetch products from backend
  const fetchProductList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedSort && selectedSort !== 'newest') {
        params.sort = selectedSort;
      }

      // Update URL query parameters for bookmarkable search
      const newParams = {};
      if (params.search) newParams.search = params.search;
      if (params.category) newParams.category = params.category;
      if (params.sort) newParams.sort = params.sort;
      setSearchParams(newParams, { replace: true });

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSort, setSearchParams]);

  // Debounced search & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProductList]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedSort('newest');
    setSearchParams({}, { replace: true });
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 70px)', paddingBottom: '5rem' }}>
      
      {/* ── Page Header / Hero (25% Black + 20% Orange Accent) ── */}
      <section
        style={{
          background: '#09090b',
          color: '#ffffff',
          padding: '3.5rem 1.5rem 2.85rem',
          borderBottom: '1px solid #27272a',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow circle background */}
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '450px', height: '450px',
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '650px' }}>
            <span
              className="badge badge-orange"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginBottom: '0.85rem',
                background: 'rgba(255, 87, 34, 0.15)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 87, 34, 0.35)',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={13} /> OFFICIAL DROP CATALOG
            </span>
            <h1
              style={{
                fontSize: '2.75rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '0.6rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Discover Products<span style={{ color: 'var(--primary)' }}>.</span>
            </h1>
            <p style={{ color: 'var(--grey-400)', fontSize: '1rem', lineHeight: 1.6 }}>
              Curated electronics, street fashion, best-selling books, and home essentials.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Catalog Content ── */}
      <div className="page-container">
        {/* Search & Filter Component */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* ── 1. Loading State ── */}
        {loading && (
          <div
            id="products-loading-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 1rem',
              gap: '1.25rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div
              className="spinner spinner-dark"
              style={{
                width: '40px',
                height: '40px',
                borderWidth: '3.5px',
                borderColor: 'var(--primary-soft)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Loading products...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                Fetching the latest catalogue from ShopKart servers
              </p>
            </div>
          </div>
        )}

        {/* ── 2. Error State ── */}
        {!loading && error && (
          <div
            id="products-error-state"
            style={{
              background: '#fff',
              border: '1.5px solid var(--error-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '550px',
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
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Failed to load catalogue
            </h3>
            <p style={{ color: 'var(--error-text)', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </p>
            <button
              id="retry-fetch-btn"
              onClick={fetchProductList}
              className="btn btn-primary-pill"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.4rem' }}
            >
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        {/* ── 3. Empty State ── */}
        {!loading && !error && products.length === 0 && (
          <div
            id="products-empty-state"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '4.5rem 2rem',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <PackageSearch size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No products found.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              We couldn't find any products matching your search criteria. Try adjusting your keywords or category filters.
            </p>
            <button
              id="empty-state-reset-btn"
              onClick={handleResetFilters}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.4rem' }}
            >
              <FilterX size={15} /> Clear All Filters
            </button>
          </div>
        )}

        {/* ── 4. Product Grid ── */}
        {!loading && !error && products.length > 0 && (
          <div
            id="products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
