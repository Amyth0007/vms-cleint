import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
                <div className="mobile-visit-card" key={visitor._id}>
                  <div className="card-header">
                    <span className="name">{visitor.name}</span>
                    <span className="badge badge-registered">{visitor.visitorType.toUpperCase()}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Mobile</span>
                    <span className="value">{visitor.mobile}</span>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link to={`/visitor/${visitor._id}`} className="btn" style={{ width: '100%', display: 'block', fontSize: '0.875rem' }}>
                      View History
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorSearch;
