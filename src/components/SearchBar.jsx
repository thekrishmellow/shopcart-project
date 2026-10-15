import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home'
];

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

const SearchBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  onResetFilters,
  totalResults
}) => {
  const isFiltered = (searchTerm && searchTerm.trim() !== '') || (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== 'All') || (selectedSort && selectedSort !== 'newest');

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto',
          gap: '1rem',
          alignItems: 'center',
        }}
        className="search-filter-grid"
      >
        {/* ── Search Input ── */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search size={18} />
          </div>

          <input
            type="text"
            id="search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name..."
            style={{
              width: '100%',
              padding: '0.75rem 2.6rem 0.75rem 2.85rem',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '50%',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Category Dropdown Filter ── */}
        <div style={{ position: 'relative' }}>
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All Categories' ? '🏷️ All Categories' : `📦 ${cat}`}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            ▼
          </div>
        </div>

        {/* ── Sort Option Dropdown (Bonus Challenge) ── */}
        <div style={{ position: 'relative' }}>
          <select
            id="sort-filter-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                ⚡ {opt.label}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            ▼
          </div>
        </div>

        {/* ── Clear/Reset Filters Button ── */}
        {isFiltered && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className="btn btn-outline"
            style={{
              padding: '0.75rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: 'var(--error)',
              borderColor: 'var(--error-border)',
              background: 'var(--error-bg)',
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Quick Category Pills ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginRight: '0.25rem',
          }}
        >
          Quick Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat || (cat === 'All Categories' && (!selectedCategory || selectedCategory === 'All'));
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1.5px solid var(--primary)' : '1.5px solid var(--border-light)',
                background: isActive ? 'var(--primary-soft)' : '#ffffff',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat}
            </button>
          );
        })}

        {totalResults !== undefined && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Showing <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> product{totalResults === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
