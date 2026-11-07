import { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from './StatusBadge';
import VisitorAvatar from './VisitorAvatar';
import EmptyState from './EmptyState';
import { formatDateTime } from '../utils/format';

const STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'registered', label: 'Registered' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'completed', label: 'Completed' },
];

const staffId = (user) => (user?._id || user?.id ? String(user._id || user.id) : '');

const emptyFilters = {
  q: '',
  status: '',
  from: '',
  to: '',
  dateField: 'createdAt',
  checkedInBy: '',
  checkedOutBy: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  page: 1,
  limit: 20,
};

const defaultFilters = (variant, userId) => {
  if (variant === 'guard') {
    return { ...emptyFilters, checkedInBy: staffId({ _id: userId }) };
  }
  return { ...emptyFilters };
};

const SortHeader = ({ field, label, sortBy, sortDir, onSort }) => (
  <th>
    <button type="button" className={`sort-th ${sortBy === field ? 'active' : ''}`} onClick={() => onSort(field)}>
      {label}
      <span className="sort-ind">{sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  </th>
);

const VisitLog = ({ onProcess, refreshKey, variant = 'admin', currentUserId }) => {
  const isGuard = variant === 'guard';
  const [filters, setFilters] = useState(() => defaultFilters(variant, currentUserId));
  const [searchInput, setSearchInput] = useState('');
  const [visits, setVisits] = useState([]);
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    stats: { registered: 0, checkedIn: 0, completed: 0, total: 0 },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => {
        const q = searchInput.trim();
        if (q === f.q) return f;
        return { ...f, q, page: 1 };
      });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (isGuard) return;
    api.get('/auth/users').then((res) => {
      if (res.data.success) setStaff(res.data.data || []);
    }).catch(() => {});
  }, [isGuard]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value != null) params.set(key, value);
        });
        const res = await api.get(`/visits?${params.toString()}`);
        if (res.data.success) {
          setVisits(res.data.data || []);
          if (res.data.meta) setMeta(res.data.meta);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load visits');
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, refreshKey]);

  const patch = (partial) => setFilters((f) => ({ ...f, ...partial, page: partial.page ?? 1 }));

  const onSort = (field) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortDir: f.sortBy === field && f.sortDir === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const stats = meta.stats || { registered: 0, checkedIn: 0, completed: 0, total: 0 };
  const fromItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const toItem = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div>
      <div className="stat-grid">
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--text-light)' }}>
          <h4>Matching visits</h4>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h4>Registered</h4>
          <p className="stat-value">{stats.registered}</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h4>Checked in</h4>
          <p className="stat-value">{stats.checkedIn}</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h4>Completed</h4>
          <p className="stat-value">{stats.completed}</p>
        </div>
      </div>

      <div className="card filter-panel">
        <div className="filter-top">
          <input
            type="search"
            className="form-control"
            placeholder="Search name or mobile"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            inputMode="search"
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearchInput('');
              setFilters(defaultFilters(variant, currentUserId));
            }}
          >
            Clear
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm filter-toggle"
          onClick={() => setShowFilters((v) => !v)}
        >
          {showFilters ? 'Hide date filters' : 'Date and staff filters'}
        </button>

        <div className={`filter-grid ${showFilters ? 'is-open' : ''}`}>
          <label className="filter-field">
            <span>From</span>
            <input
              type="datetime-local"
              className="form-control"
              value={filters.from}
              onChange={(e) => patch({ from: e.target.value })}
            />
          </label>
          <label className="filter-field">
            <span>To</span>
            <input
              type="datetime-local"
              className="form-control"
              value={filters.to}
              onChange={(e) => patch({ to: e.target.value })}
            />
          </label>
          <label className="filter-field">
            <span>Date applies to</span>
            <select
              className="form-control"
              value={filters.dateField}
              onChange={(e) => patch({ dateField: e.target.value })}
            >
              <option value="createdAt">Registered at</option>
              <option value="checkInTime">Check-in time</option>
              <option value="checkOutTime">Check-out time</option>
            </select>
          </label>
          {!isGuard && (
            <>
              <label className="filter-field">
                <span>Checked in by</span>
                <select
                  className="form-control"
                  value={filters.checkedInBy}
                  onChange={(e) => patch({ checkedInBy: e.target.value })}
                >
                  <option value="">Anyone</option>
                  {staff.map((u) => (
                    <option key={staffId(u)} value={staffId(u)}>{u.name}</option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>Checked out by</span>
                <select
                  className="form-control"
                  value={filters.checkedOutBy}
                  onChange={(e) => patch({ checkedOutBy: e.target.value })}
                >
                  <option value="">Anyone</option>
                  {staff.map((u) => (
                    <option key={`out-${staffId(u)}`} value={staffId(u)}>{u.name}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        {isGuard && currentUserId && (
          <div className="chips" style={{ marginTop: '0.85rem' }}>
            <button
              type="button"
              className={`chip ${filters.checkedInBy === currentUserId ? 'active' : ''}`}
              onClick={() => patch({ checkedInBy: currentUserId })}
            >
              Checked in by me
            </button>
            <button
              type="button"
              className={`chip ${filters.checkedInBy === '' ? 'active' : ''}`}
              onClick={() => patch({ checkedInBy: '' })}
            >
              All visits
            </button>
          </div>
        )}

        <div className="chips" style={{ marginTop: isGuard ? '0.5rem' : '0.85rem' }}>
          {STATUS_CHIPS.filter((opt) => !isGuard || opt.value !== '').map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`chip ${filters.status === opt.value ? 'active' : ''}`}
              onClick={() => patch({
                status: isGuard && filters.status === opt.value ? '' : opt.value,
              })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <p className="muted">Loading visits…</p>
        ) : visits.length === 0 ? (
          <EmptyState
            title="No visits yet"
            text={error ? 'Try again in a moment.' : 'No visits match these filters. Register a visitor or scan a QR to get started.'}
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="desktop-table analytics-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Pass</th>
                    <SortHeader field="status" label="Status" sortBy={filters.sortBy} sortDir={filters.sortDir} onSort={onSort} />
                    <SortHeader field="checkInTime" label="Check-in" sortBy={filters.sortBy} sortDir={filters.sortDir} onSort={onSort} />
                    <SortHeader field="checkOutTime" label="Check-out" sortBy={filters.sortBy} sortDir={filters.sortDir} onSort={onSort} />
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit._id}>
                      <td>
                        <div className="visitor-cell">
                          <VisitorAvatar src={visit.visitor?.photo} name={visit.visitor?.name} size={36} />
                          <div>
                            <div>{visit.visitor?.name}</div>
                            <div className="col-secondary">{visit.visitor?.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td>{visit.pass?.code || 'Phone'}</td>
                      <td><StatusBadge status={visit.status} /></td>
                      <td>
                        <div>{formatDateTime(visit.checkInTime)}</div>
                        <div className="col-secondary">{visit.checkedInBy?.name || '—'}</div>
                      </td>
                      <td>
                        <div>{formatDateTime(visit.checkOutTime)}</div>
                        <div className="col-secondary">{visit.checkedOutBy?.name || '—'}</div>
                      </td>
                      <td>
                        {visit.status !== 'completed' && (
                          <button type="button" className="btn btn-sm" onClick={() => onProcess(visit._id)}>
                            Scan to process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list">
              {visits.map((visit) => (
                <div key={visit._id} className="mobile-visit-card">
                  <div className="card-header">
                    <span className="name visitor-cell">
                      <VisitorAvatar src={visit.visitor?.photo} name={visit.visitor?.name} size={32} />
                      {visit.visitor?.name}
                    </span>
                    <StatusBadge status={visit.status} />
                  </div>
                  <div className="visit-facts">
                    <div className="visit-fact">
                      <span className="label">Mobile</span>
                      <span className="value">{visit.visitor?.mobile || '—'}</span>
                    </div>
                    <div className="visit-fact">
                      <span className="label">Pass</span>
                      <span className="value">{visit.pass?.code || 'Phone'}</span>
                    </div>
                    <div className="visit-fact">
                      <span className="label">Check-in</span>
                      <span className="value">{formatDateTime(visit.checkInTime)}</span>
                      <span className="hint">{visit.checkedInBy?.name || '—'}</span>
                    </div>
                    <div className="visit-fact">
                      <span className="label">Check-out</span>
                      <span className="value">{formatDateTime(visit.checkOutTime)}</span>
                      <span className="hint">{visit.checkedOutBy?.name || '—'}</span>
                    </div>
                  </div>
                  {visit.status !== 'completed' && (
                    <button type="button" className="btn visit-process-btn" onClick={() => onProcess(visit._id)}>
                      Scan QR to {visit.status === 'checked_in' ? 'check out' : 'check in'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pager">
              <span className="muted">
                {fromItem}–{toItem} of {meta.total}
              </span>
              <div className="pager-controls">
                <button type="button" className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => patch({ page: meta.page - 1 })}>
                  Previous
                </button>
                <span className="pager-page">Page {meta.page} / {meta.pages}</span>
                <button type="button" className="btn btn-ghost btn-sm" disabled={meta.page >= meta.pages} onClick={() => patch({ page: meta.page + 1 })}>
                  Next
                </button>
              </div>
              <select
                className="form-control pager-size"
                value={filters.limit}
                onChange={(e) => patch({ limit: Number(e.target.value) })}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitLog;
