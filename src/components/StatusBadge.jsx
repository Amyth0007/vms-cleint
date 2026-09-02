import { statusLabel } from '../utils/format';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  return <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
};

export default StatusBadge;
