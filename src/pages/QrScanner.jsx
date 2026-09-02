import { useRef, useState } from 'react';
import api from '../services/api';
import VisitScanPanel from '../components/VisitScanPanel';
import QrCapture from '../components/QrCapture';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [visitInfo, setVisitInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const busyRef = useRef(false);

  const handleDecode = async (token) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setScanResult(token);
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const preview = await api.post('/visits/scan', { qrToken: token });
      const visit = preview.data.data;
      setVisitInfo(visit);

      if (visit.status === 'completed') {
        setMessage('This visit is already completed.');
        return;
      }

      const action = visit.status === 'registered' ? 'check-in' : 'check-out';
      const response = await api.post(`/visits/${action}`, { qrToken: token });
      if (response.data.success) {
        setVisitInfo(response.data.data);
        setMessage(`Visitor successfully ${action === 'check-in' ? 'checked in' : 'checked out'}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    busyRef.current = false;
    setScanResult(null);
    setVisitInfo(null);
    setError('');
    setMessage('');
  };

  return (
    <div className="scan-page">
      <h2 className="page-title">Scan QR</h2>
      <p className="page-sub">Hold the camera on the pass or phone QR. Check-in and check-out happen from the scan.</p>

      {!scanResult ? (
        <div className="card">
          <QrCapture onDecode={handleDecode} />
        </div>
      ) : (
        <div className="card">
          <VisitScanPanel
            visit={visitInfo}
            loading={loading}
            error={error}
            message={message}
            onSecondary={resetScanner}
            secondaryLabel="Scan another"
          />
        </div>
      )}
    </div>
  );
};

export default QrScanner;
