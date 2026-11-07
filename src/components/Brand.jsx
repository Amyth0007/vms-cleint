const Brand = ({ compact = false }) => (
  <span className={`brand-lockup ${compact ? 'brand-lockup-compact' : ''}`}>
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 11V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" />
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="16" r="1.4" />
      </svg>
    </span>
    <span className="brand-text">
      College VMS
      {!compact && <span className="brand-tag">Campus</span>}
    </span>
  </span>
);

export default Brand;
