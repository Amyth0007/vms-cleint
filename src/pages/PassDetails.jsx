import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const PassDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/passes/${id}/history`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pass history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingState text="Loading pass history…" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <EmptyState title="Pass not found" text="This pass may have been removed." />;

  const { pass, visits } = data;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="no-print">
        <PageHeader
          title={`${pass.code} history`}
          subtitle="Who has used this physical pass."
          actions={<Link to="/passes" className="btn btn-ghost btn-sm">Back to passes</Link>}
        />
      </div>

      <div className="card" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <img src={pass.qrCode} alt={pass.code} style={{ width: 160, height: 160 }} />
        <div>
          <p><strong>Code:</strong> {pass.code}</p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Status:</strong>{' '}
            <StatusBadge status={pass.status} />
          </p>
          <p style={{ marginTop: '0.5rem' }}><strong>Times used:</strong> {pass.useCount}</p>
          <button type="button" className="btn no-print" style={{ marginTop: '1rem' }} onClick={() => window.print()}>
            Print this card
          </button>
        </div>
      </div>

      <div className="card no-print" style={{ marginTop: '1.5rem' }}>
        <h3>Who used this pass</h3>
        {visits.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>No visits yet.</p>
        ) : (
          <>
            <table className="desktop-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Mobile</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Registered by</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit._id}>
                    <td>
                      {visit.visitor?._id ? (
                        <Link to={`/visitor/${visit.visitor._id}`}>{visit.visitor.name}</Link>
                      ) : (
                        visit.visitor?.name || '-'
                      )}
                    </td>
                    <td>{visit.visitor?.mobile || '-'}</td>
                    <td>{visit.purpose || '-'}</td>
                    <td><StatusBadge status={visit.status} /></td>
                    <td className="col-secondary">{formatDateTime(visit.checkInTime)}</td>
                    <td className="col-secondary">{formatDateTime(visit.checkOutTime)}</td>
                    <td>{visit.registeredBy?.name || 'Self'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-card-list" style={{ marginTop: '1rem' }}>
              {visits.map((visit) => (
                <div key={visit._id} className="mobile-visit-card">
                  <div className="card-header">
                    <span className="name">{visit.visitor?.name}</span>
                    <StatusBadge status={visit.status} />
                  </div>
                  <div className="card-row">
                    <span className="label">Mobile</span>
                    <span className="value">{visit.visitor?.mobile}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Purpose</span>
                    <span className="value">{visit.purpose || '-'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Check-in</span>
                    <span className="value">{visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : '-'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Check-out</span>
                    <span className="value">{visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleString() : '-'}</span>
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

export default PassDetails;
