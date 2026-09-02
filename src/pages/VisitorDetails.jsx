import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatTime } from '../utils/format';

const ExpandableHistoryCard = ({ visit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
      <div 
        className="card-header" 
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', marginBottom: isExpanded ? '0.5rem' : '0', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          <span className="name">{new Date(visit.createdAt).toLocaleDateString()}</span>
        </div>
        <StatusBadge status={visit.status} />
      </div>
      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="card-row">
            <span className="label">Host</span>
            <span className="value">{visit.hostName || '-'} ({visit.hostDepartment || '-'})</span>
          </div>
          <div className="card-row">
            <span className="label">Pass</span>
            <span className="value">{visit.pass?.code || 'Phone'}</span>
          </div>
          <div className="card-row">
            <span className="label">Purpose</span>
            <span className="value">{visit.purpose || '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">Check-In</span>
            <span className="value">{visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">Check-Out</span>
            <span className="value">{visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString() : '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const VisitorDetails = () => {
  const { id } = useParams();
  const [visitor, setVisitor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisitorAndHistory = async () => {
      try {
        const visitorRes = await api.get(`/visitors/${id}`);
        const historyRes = await api.get(`/visits/visitor/${id}`);
        
        if (visitorRes.data.success) {
          setVisitor(visitorRes.data.data);
        }
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load visitor details');
      } finally {
        setLoading(false);
      }
    };
    fetchVisitorAndHistory();
  }, [id]);

  if (loading) return <p>Loading details...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!visitor) return <p>Visitor not found.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Visitor</h2>
        <Link to="/search-visitor" className="btn-link">Back to search</Link>
      </div>

      <div className="card">
        <h3>Personal Details</h3>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <p><strong>Name:</strong> {visitor.name}</p>
          <p><strong>Mobile:</strong> {visitor.mobile}</p>
          <p><strong>Type:</strong> {visitor.visitorType.toUpperCase()}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Visit History</h3>
        {history.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>No visit history found for this visitor.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Host</th>
                  <th>Pass</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                </tr>
              </thead>
              <tbody>
                {history.map((visit) => (
                  <tr key={visit._id}>
                    <td>{new Date(visit.createdAt).toLocaleDateString()}</td>
                    <td>{visit.hostName || '-'} ({visit.hostDepartment || '-'})</td>
                    <td>{visit.pass?.code || 'Phone'}</td>
                    <td>{visit.purpose || '-'}</td>
                    <td><StatusBadge status={visit.status} /></td>
                    <td>{formatTime(visit.checkInTime)}</td>
                    <td>{formatTime(visit.checkOutTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-card-list" style={{ marginTop: '1rem' }}>
              {history.map((visit) => (
                <ExpandableHistoryCard key={visit._id} visit={visit} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorDetails;
