import StatusBadge from './StatusBadge';
import PhotoCapture from './PhotoCapture';
import VisitorAvatar from './VisitorAvatar';

const DetailRow = ({ label, children }) => (
  <div className="scan-detail-row">
    <strong>{label}</strong>
    <span>{children}</span>
  </div>
);

const VisitScanPanel = ({
  visit,
  loading,
  error,
  message,
  onSecondary,
  secondaryLabel = 'Close',
  photoUrl,
  onPhotoChange,
  onProcess,
  processLabel,
}) => (
  <div>
    {error && <div className="alert alert-error">{error}</div>}
    {message && <div className="alert alert-success">{message}</div>}

    {loading && !visit ? (
      <p className="muted">Loading visit details…</p>
    ) : visit ? (
      <>
        <div className="scan-hero">
          <VisitorAvatar src={photoUrl || visit.visitor?.photo} name={visit.visitor?.name} size={84} />
          <div>
            <h3 style={{ marginBottom: '0.2rem' }}>{visit.visitor?.name}</h3>
            <p className="muted" style={{ margin: 0 }}>{visit.visitor?.mobile}</p>
            <div style={{ marginTop: '0.45rem' }}>
              <StatusBadge status={visit.status} />
            </div>
          </div>
        </div>

        {onPhotoChange && (
          <PhotoCapture
            compact
            value={photoUrl || visit.visitor?.photo || ''}
            onChange={onPhotoChange}
            name={visit.visitor?.name}
          />
        )}

        <div className="scan-details">
          <DetailRow label="Type">{visit.visitor?.visitorType || '—'}</DetailRow>
          <DetailRow label="Host">
            {visit.hostName || '—'}
            {visit.hostDepartment ? ` (${visit.hostDepartment})` : ''}
          </DetailRow>
          <DetailRow label="Purpose">{visit.purpose || '—'}</DetailRow>
          <DetailRow label="Pass">{visit.pass?.code || 'Phone QR'}</DetailRow>
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onProcess && visit.status !== 'completed' && (
            <button type="button" className="btn" onClick={onProcess} disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Processing…' : processLabel || (visit.status === 'registered' ? 'Check in' : 'Check out')}
            </button>
          )}
          {visit.status === 'completed' && (
            <p className="muted" style={{ flex: 1, margin: 0 }}>This visit is already completed.</p>
          )}
          <button type="button" className="btn-link" onClick={onSecondary} disabled={loading}>
            {secondaryLabel}
          </button>
        </div>
      </>
    ) : null}
  </div>
);

export default VisitScanPanel;
