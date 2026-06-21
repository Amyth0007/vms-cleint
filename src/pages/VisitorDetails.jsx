import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

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
        <h2>Visitor Profile & History</h2>
        <Link to="/search-visitor" className="btn" style={{ backgroundColor: 'var(--text-light)' }}>
          Back to Search
        </Link>
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
                    <td>{visit.purpose || '-'}</td>
                    <td>
                      <span className={`badge badge-${visit.status}`}>
                        {visit.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td>{visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-card-list" style={{ marginTop: '1rem' }}>
              {history.map((visit) => (
                <div className="mobile-visit-card" key={visit._id}>
                  <div className="card-header">
                    <span className="name">{new Date(visit.createdAt).toLocaleDateString()}</span>
                    <span className={`badge badge-${visit.status}`}>
                      {visit.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Host</span>
                    <span className="value">{visit.hostName || '-'} ({visit.hostDepartment || '-'})</span>
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorDetails;
