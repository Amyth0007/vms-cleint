import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [visitInfo, setVisitInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only init scanner if we don't have a result yet
    if (scanResult) return;

    // Calculate responsive QR box size
    const screenWidth = window.innerWidth;
    const qrBoxSize = screenWidth < 400 ? 180 : screenWidth < 768 ? 220 : 250;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: qrBoxSize, height: qrBoxSize },
      fps: 5,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(e => console.error("Error clearing scanner:", e));
        setScanResult(decodedText);
        fetchVisitDetails(decodedText);
      },
      (error) => {
        // Ignore scan errors, they happen continuously until a code is found
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [scanResult]);

  const fetchVisitDetails = async (token) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/visits/scan', { qrToken: token });
      if (response.data.success) {
        setVisitInfo(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!scanResult) return;
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const endpoint = action === 'check-in' ? '/visits/check-in' : '/visits/check-out';
      const response = await api.post(endpoint, { qrToken: scanResult });
      
      if (response.data.success) {
        setMessage(`Visitor successfully ${action === 'check-in' ? 'checked in' : 'checked out'}!`);
        setVisitInfo(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setVisitInfo(null);
    setError('');
    setMessage('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>QR Scanner</h2>
      
      {!scanResult ? (
        <div className="card" style={{ marginTop: '1.5rem', padding: '1rem' }}>
          <div id="qr-reader" style={{ width: '100%' }}></div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          
          {loading ? (
            <p>Loading visit details...</p>
          ) : visitInfo ? (
            <div>
              <h3>Visit Details</h3>
              <div style={{ margin: '1rem 0' }}>
                <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>Visitor Name</strong>
                  <span>{visitInfo.visitor?.name}</span>
                </div>
                <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>Mobile</strong>
                  <span>{visitInfo.visitor?.mobile}</span>
                </div>
                <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>Type</strong>
                  <span>{visitInfo.visitor?.visitorType}</span>
                </div>
                <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>Host</strong>
                  <span>{visitInfo.hostName || '-'} ({visitInfo.hostDepartment || '-'})</span>
                </div>
                <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', alignItems: 'center' }}>
                  <strong>Status</strong>
                  <span className={`badge badge-${visitInfo.status}`}>
                    {visitInfo.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                {visitInfo.status === 'registered' && (
                  <button className="btn" onClick={() => handleAction('check-in')} disabled={loading} style={{ flex: 1 }}>
                    ✅ Check In
                  </button>
                )}
                
                {visitInfo.status === 'checked_in' && (
                  <button className="btn" onClick={() => handleAction('check-out')} disabled={loading} style={{ backgroundColor: '#f59e0b', flex: 1 }}>
                    🚪 Check Out
                  </button>
                )}
                
                <button className="btn" onClick={resetScanner} style={{ backgroundColor: 'var(--text-light)', flex: 1 }}>
                  🔄 Scan Another
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default QrScanner;
