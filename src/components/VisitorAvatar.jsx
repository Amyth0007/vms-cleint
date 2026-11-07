const VisitorAvatar = ({ src, name = '', size = 40, className = '' }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Visitor'}
        className={`visitor-avatar ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`visitor-avatar visitor-avatar-fallback ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

export default VisitorAvatar;
