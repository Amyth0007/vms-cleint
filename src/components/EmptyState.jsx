const EmptyState = ({ title, text, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon" aria-hidden="true">◎</div>
    {title ? <h3>{title}</h3> : null}
    {text ? <p className="muted">{text}</p> : null}
    {action}
  </div>
);

export default EmptyState;
