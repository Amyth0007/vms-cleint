const LoadingState = ({ text = 'Loading…' }) => (
  <div className="loading-state" role="status">
    <span className="spinner" />
    <span className="muted">{text}</span>
  </div>
);

export default LoadingState;
