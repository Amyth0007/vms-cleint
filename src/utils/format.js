export const statusLabel = (status = '') =>
  status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const formatTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${formatTime(value)}`;
};

export const initials = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};
