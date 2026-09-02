import { useState } from 'react';
import ProcessVisitModal from '../components/ProcessVisitModal';
import VisitLog from '../components/VisitLog';
import { useAuth } from '../hooks/useAuth';

const staffId = (user) => (user?._id || user?.id ? String(user._id || user.id) : '');

const GuardDashboard = () => {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [logTick, setLogTick] = useState(0);

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <p className="page-sub">Scan the visitor QR. Use All visits if you need the list.</p>

      {staffId(user) ? (
        <VisitLog
          variant="guard"
          currentUserId={staffId(user)}
          onProcess={setProcessingId}
          refreshKey={logTick}
        />
      ) : (
        <p className="muted">Loading…</p>
      )}

      {processingId && (
        <ProcessVisitModal
          visitId={processingId}
          onClose={() => setProcessingId(null)}
          onUpdated={() => setLogTick((n) => n + 1)}
        />
      )}
    </div>
  );
};

export default GuardDashboard;
