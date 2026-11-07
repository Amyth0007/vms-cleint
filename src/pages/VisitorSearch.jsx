import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FieldError from '../components/FieldError';
import VisitorAvatar from '../components/VisitorAvatar';
import { rules } from '../utils/validation';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const ExpandableVisitorCard = ({ visitor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-header">
        <span className="name visitor-cell">
          <VisitorAvatar src={visitor.photo} name={visitor.name} size={32} />
          {visitor.name}
        </span>
        <span className="badge badge-registered">{visitor.visitorType}</span>
      </div>
      {isExpanded && (
        <div>
          <div className="card-row">
            <span className="label">Mobile</span>
            <span className="value">{visitor.mobile}</span>
          </div>
          <div style={{ marginTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <Link to={`/visitor/${visitor._id}`} className="btn-link">Profile</Link>
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
  const [searched, setSearched] = useState(false);

  const [fieldError, setFieldError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const message = rules.searchQuery(query);
    setFieldError(message);
    if (message) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await api.get(`/visitors/search?q=${encodeURIComponent(query.trim())}`);
      if (response.data.success) setVisitors(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-narrow">
      <PageHeader title="Search visitors" subtitle="Find someone by name or mobile number." />
      <div className="card">
        <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className={`form-control ${fieldError ? 'is-invalid' : ''}`}
            placeholder="Name or mobile"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (fieldError) setFieldError('');
            }}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
        <FieldError message={fieldError} />
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

      {searched && (
        <div className="card" style={{ marginTop: '1rem' }}>
          {visitors.length === 0 ? (
            <EmptyState title={loading ? 'Searching…' : 'No matches'} text={loading ? 'Looking up visitors.' : 'Try another name or mobile number.'} />
          ) : (
            <>
              <table className="desktop-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td>
                        <div className="visitor-cell">
                          <VisitorAvatar src={visitor.photo} name={visitor.name} size={36} />
                          <span>{visitor.name}</span>
                        </div>
                      </td>
                      <td className="col-secondary">{visitor.mobile}</td>
                      <td className="col-secondary">{visitor.visitorType}</td>
                      <td>
                        <Link to={`/visitor/${visitor._id}`} className="btn-link">Profile</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mobile-card-list">
                {visitors.map((visitor) => (
                  <ExpandableVisitorCard key={visitor._id} visitor={visitor} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorSearch;
