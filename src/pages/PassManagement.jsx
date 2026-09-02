import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { statusLabel } from '../utils/format';

const PassCard = ({ pass, onRelease, onToggle, compact }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const holder = pass.currentVisit?.visitor;

  const goHistory = () => navigate(`/passes/${pass._id}`);

  return (
    <div className={`pass-card pass-card-${pass.status}`}>
      <div className="pass-card-top">
        <span className="pass-code">{pass.code}</span>
        {!compact && (
          <div className="pass-card-menu no-print">
            <button type="button" className="icon-btn" aria-label="Pass actions" onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}>⋯</button>
            {menuOpen && (
              <div className="pass-menu-list">
                <Link to={`/passes/${pass._id}`} onClick={(e) => e.stopPropagation()}>History</Link>
                {pass.status === 'in_use' && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRelease(pass._id); }}>Release</button>
                )}
                {pass.status !== 'in_use' && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onToggle(pass._id); }}>
                    {pass.status === 'disabled' ? 'Enable' : 'Disable'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {compact && <StatusBadge status={pass.status} />}
      </div>
      <img src={pass.qrCode} alt={pass.code} className="pass-qr" onClick={compact ? undefined : goHistory} style={{ cursor: compact ? 'default' : 'pointer' }} />
      {!compact && (
        <>
          <p className="pass-meta">Used {pass.useCount} time{pass.useCount === 1 ? '' : 's'}</p>
          {pass.status === 'in_use' && holder && (
            <p className="pass-holder">With {holder.name}</p>
          )}
          <StatusBadge status={pass.status} />
        </>
      )}
    </div>
  );
};

const PassManagement = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/passes');
      if (res.data.success) setPasses(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, []);
  useEffect(() => {
    const onAfterPrint = () => setPrintMode(false);
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);

  const stats = {
    available: passes.filter((p) => p.status === 'available').length,
    in_use: passes.filter((p) => p.status === 'in_use').length,
    disabled: passes.filter((p) => p.status === 'disabled').length,
  };
  const visible = filter ? passes.filter((p) => p.status === filter) : passes;
  const printable = visible.filter((p) => p.status !== 'disabled');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGenerating(true);
    try {
      const res = await api.post('/passes/generate', { count: Number(count) });
      if (res.data.success) {
        setSuccess(res.data.message);
        await fetchPasses();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate passes');
    } finally {
      setGenerating(false);
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm('Release this pass? The current visit will be marked completed.')) return;
    try {
      await api.post(`/passes/${id}/release`);
      fetchPasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release pass');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/passes/${id}/toggle`);
      fetchPasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pass');
    }
  };

  return (
    <div className={printMode ? 'print-passes-view' : ''}>
      <div className="toolbar no-print">
        <div>
          <h2 className="page-title">QR passes</h2>
          <p className="page-sub">Physical cards for visitors without a phone</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setPrintMode(true);
            setTimeout(() => window.print(), 200);
          }}
        >
          Print
        </button>
      </div>

      {printMode && (
        <div className="no-print" style={{ marginBottom: '1rem' }}>
          <button type="button" className="btn-link" onClick={() => setPrintMode(false)}>Exit print view</button>
        </div>
      )}

      {!printMode && (
        <>
          <div className="stat-grid no-print">
            <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <h4>Available</h4>
              <p className="stat-value">{stats.available}</p>
            </div>
            <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <h4>In use</h4>
              <p className="stat-value">{stats.in_use}</p>
            </div>
            <div className="card stat-card" style={{ borderLeft: '4px solid var(--text-light)' }}>
              <h4>Disabled</h4>
              <p className="stat-value">{stats.disabled}</p>
            </div>
          </div>

          <div className="card no-print" style={{ marginBottom: '1rem' }}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleGenerate} className="toolbar" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0, width: 120 }}>
                <label className="form-label">Generate</label>
                <input type="number" min="1" max="50" className="form-control" value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
              <button type="submit" className="btn" disabled={generating}>
                {generating ? 'Working…' : 'Create'}
              </button>
            </form>
          </div>

          <div className="chips no-print" style={{ marginBottom: '1rem' }}>
            {['', 'available', 'in_use', 'disabled'].map((value) => (
              <button
                key={value || 'all'}
                type="button"
                className={`chip ${filter === value ? 'active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {value ? statusLabel(value) : 'All'}
              </button>
            ))}
          </div>
        </>
      )}

      {loading ? (
        <p className="muted">Loading passes…</p>
      ) : visible.length === 0 ? (
        <div className="card">
          <p className="muted">{passes.length === 0 ? 'No passes yet. Create a batch to get started.' : 'No passes match this filter.'}</p>
        </div>
      ) : (
        <div className="pass-grid">
          {(printMode ? printable : visible).map((pass) => (
            <PassCard key={pass._id} pass={pass} compact={printMode} onRelease={handleRelease} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PassManagement;
