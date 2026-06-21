import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
                <div className="mobile-visit-card" key={visit._id}>
                  <div className="card-header">
                    <span className="name">{visit.visitor?.name}</span>
                    <span className={`badge badge-${visit.status}`}>
                      {visit.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuardDashboard;
