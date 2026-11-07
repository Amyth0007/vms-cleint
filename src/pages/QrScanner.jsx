import { useRef, useState } from 'react';
import api from '../services/api';
import VisitScanPanel from '../components/VisitScanPanel';
import QrCapture from '../components/QrCapture';
import PageHeader from '../components/PageHeader';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [visitInfo, setVisitInfo] = useState(null);
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const busyRef = useRef(false);

  const handleDecode = async (token) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const preview = await api.post('/visits/scan', { qrToken: token });
      const visit = preview.data.data;
      setScanResult(token);
      setVisitInfo(visit);
      setPhoto(visit.visitor?.photo || '');
      if (visit.status === 'completed') {
        setMessage('This visit is already completed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid QR code');
      busyRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const persistPhoto = async (visit, nextPhoto) => {
    const visitorId = visit?.visitor?._id;
    if (!visitorId) return visit;
    const photo = nextPhoto || null;
    if ((visit.visitor?.photo || null) === photo) return visit;
    const res = await api.put(`/visitors/${visitorId}`, { photo });
    return {
      ...visit,
      visitor: res.data.data || { ...visit.visitor, photo },
    };
  };

  const handlePhotoChange = async (url) => {
    setPhoto(url);
    if (!visitInfo?.visitor?._id) return;
    try {
      const next = await persistPhoto(visitInfo, url);
      setVisitInfo(next);
    } catch {
      /* keep local preview */
    }
  };

  const processVisit = async () => {
    if (!scanResult || !visitInfo || visitInfo.status === 'completed') return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const withPhoto = await persistPhoto(visitInfo, photo);
      const action = withPhoto.status === 'registered' ? 'check-in' : 'check-out';
      const response = await api.post(`/visits/${action}`, { qrToken: scanResult });
      if (response.data.success) {
        const next = response.data.data;
        if (withPhoto.visitor?.photo && next.visitor) next.visitor.photo = withPhoto.visitor.photo;
        setVisitInfo(next);
        setPhoto(next.visitor?.photo || photo);
        setMessage(`Visitor successfully ${action === 'check-in' ? 'checked in' : 'checked out'}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process this visit');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    busyRef.current = false;
    setScanResult(null);
    setVisitInfo(null);
    setPhoto('');
    setError('');
    setMessage('');
  };

  return (
    <div className="scan-page">
      <PageHeader
        title="Gate scan"
        subtitle="Scan the pass or phone QR, optionally capture a photo, then check in or out."
      />

      {!scanResult ? (
        <div className="card scan-card">
          {error && <div className="alert alert-error">{error}</div>}
          {loading && <p className="muted">Looking up this visit…</p>}
          <QrCapture onDecode={handleDecode} paused={loading} />
        </div>
      ) : (
        <div className="card">
          <VisitScanPanel
            visit={visitInfo}
            loading={loading}
            error={error}
            message={message}
            photoUrl={photo}
            onPhotoChange={handlePhotoChange}
            onProcess={visitInfo?.status !== 'completed' ? processVisit : undefined}
            onSecondary={resetScanner}
            secondaryLabel="Scan another"
          />
        </div>
      )}
    </div>
  );
};

export default QrScanner;
