import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import VisitScanPanel from './VisitScanPanel';
import QrCapture from './QrCapture';

const ProcessVisitModal = ({ visitId, onClose, onUpdated }) => {
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      setDone(false);
      busyRef.current = false;
      try {
        const res = await api.get(`/visits/${visitId}`);
        if (res.data.success) {
          const data = res.data.data;
          setVisit(data);
          if (data.status === 'completed') setDone(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load visit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [visitId]);

  const handleDecode = async (token) => {
    if (busyRef.current || !visit) return;
    busyRef.current = true;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const preview = await api.post('/visits/scan', { qrToken: token });
      const scanned = preview.data.data;
      if (scanned._id !== visit._id) {
        throw new Error('This QR does not belong to this visit. Scan the matching phone QR or pass.');
      }

      if (scanned.status === 'completed') {
        setVisit(scanned);
        setMessage('This visit is already completed.');
        setDone(true);
        return;
      }

      const action = scanned.status === 'registered' ? 'check-in' : 'check-out';
      const res = await api.post(`/visits/${action}`, { qrToken: token });
      if (res.data.success) {
        setVisit(res.data.data);
        setMessage(`Visitor successfully ${action === 'check-in' ? 'checked in' : 'checked out'}!`);
        setDone(true);
        onUpdated?.(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Scan failed');
      busyRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const showCamera = visit && !done && (visit.status === 'registered' || visit.status === 'checked_in');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {loading && !visit ? (
          <p className="muted">Loading visit details…</p>
        ) : error && !visit ? (
          <>
            <div className="alert alert-error">{error}</div>
            <button type="button" className="btn-link" onClick={onClose}>Close</button>
          </>
        ) : showCamera ? (
          <>
            <h3>Scan to {visit.status === 'registered' ? 'check in' : 'check out'}</h3>
            <p className="page-sub" style={{ marginBottom: '0.75rem' }}>
              {visit.visitor?.name}
              {visit.pass?.code ? ` · ${visit.pass.code}` : ' · Phone QR'}
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            {loading && <p className="muted">Processing scan…</p>}
            <QrCapture onDecode={handleDecode} paused={Boolean(loading && visit)} />
            <button type="button" className="btn-link" onClick={onClose} style={{ marginTop: '0.5rem' }}>
              Close
            </button>
          </>
        ) : (
          <VisitScanPanel
            visit={visit}
            loading={loading}
            error={error}
            message={message}
            onSecondary={onClose}
            secondaryLabel="Close"
          />
        )}
      </div>
    </div>
  );
};

export default ProcessVisitModal;
