import StatusBadge from './StatusBadge';

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
}) => (
  <div>
    {error && <div className="alert alert-error">{error}</div>}
    {message && <div className="alert alert-success">{message}</div>}

    {loading && !visit ? (
      <p className="muted">Loading visit details…</p>
    ) : visit ? (
      <>
        <h3>Visit details</h3>
        <div className="scan-details">
          <DetailRow label="Visitor">{visit.visitor?.name}</DetailRow>
          <DetailRow label="Mobile">{visit.visitor?.mobile}</DetailRow>
          <DetailRow label="Type">{visit.visitor?.visitorType || '—'}</DetailRow>
          <DetailRow label="Host">
            {visit.hostName || '—'}
            {visit.hostDepartment ? ` (${visit.hostDepartment})` : ''}
          </DetailRow>
          <DetailRow label="Purpose">{visit.purpose || '—'}</DetailRow>
          <DetailRow label="Pass">{visit.pass?.code || 'Phone QR'}</DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={visit.status} />
          </DetailRow>
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}>
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
