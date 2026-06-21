import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ExpandableVisitorCard = ({ visitor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
      <div 
        className="card-header" 
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', marginBottom: isExpanded ? '0.5rem' : '0', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          <span className="name">{visitor.name}</span>
        </div>
        <span className="badge badge-registered">{visitor.visitorType.toUpperCase()}</span>
      </div>
      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="card-row">
            <span className="label">Mobile</span>
            <span className="value">{visitor.mobile}</span>
          </div>
          <div style={{ marginTop: '0.75rem' }} onClick={e => e.stopPropagation()}>
            <Link to={`/visitor/${visitor._id}`} className="btn" style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '0.875rem', padding: '0.5rem' }}>
              View History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const VisitorSearch = () => {
  const [query, setQuery] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/visitors/search?q=${query}`);
      if (response.data.success) {
        setVisitors(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Visitor Search</h2>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or Mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Search Results</h3>
        {visitors.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>No search results. Enter name or mobile number to search.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Visitor Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>{visitor.name}</td>
                    <td>{visitor.mobile}</td>
                    <td>{visitor.visitorType.toUpperCase()}</td>
                    <td>
                      <Link to={`/visitor/${visitor._id}`} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                        View History
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-card-list" style={{ marginTop: '1rem' }}>
              {visitors.map((visitor) => (
                <ExpandableVisitorCard key={visitor._id} visitor={visitor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorSearch;
