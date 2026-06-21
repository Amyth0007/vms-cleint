import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ExpandableVisitCard = ({ visit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mobile-visit-card" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
      <div 
        className="card-header" 
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', marginBottom: isExpanded ? '0.5rem' : '0', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          <span className="name">{visit.visitor?.name}</span>
        </div>
        <span className={`badge badge-${visit.status}`}>
          {visit.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="card-row">
            <span className="label">Mobile</span>
            <span className="value">{visit.visitor?.mobile}</span>
          </div>
          <div className="card-row">
            <span className="label">Host</span>
            <span className="value">{visit.hostName || '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">Check-in</span>
            <span className="value">
              {visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : '-'}
            </span>
          </div>
          <div className="card-row">
            <span className="label">Check-out</span>
            <span className="value">
              {visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString() : '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const GuardDashboard = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayVisits = async () => {
      try {
        const response = await api.get('/visits/today');
        if (response.data.success) {
          setVisits(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching visits', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayVisits();
  }, []);

  return (
    <div>
      <h2>Guard Dashboard — Today's Visits</h2>
      
      <Link to="/qr-scanner" className="btn guard-scan-btn" style={{ display: 'none', width: '100%', margin: '1rem 0', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-color)' }}>
        📷 Scan Entry/Exit QR Code
      </Link>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <p>Loading...</p>
        ) : visits.length === 0 ? (
          <p>No visits today.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Mobile</th>
                  <th>Host</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                  <th>Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit._id}>
                    <td>{visit.visitor?.name}</td>
                    <td>{visit.visitor?.mobile}</td>
                    <td>{visit.hostName || '-'}</td>
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
            <div className="mobile-card-list">
              {visits.map((visit) => (
                <ExpandableVisitCard key={visit._id} visit={visit} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuardDashboard;
