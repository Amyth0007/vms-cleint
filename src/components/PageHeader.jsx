const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-heading">
    <div>
      <h2 className="page-title">{title}</h2>
      {subtitle ? <p className="page-sub">{subtitle}</p> : null}
    </div>
    {actions ? <div className="page-heading-actions">{actions}</div> : null}
  </div>
);

export default PageHeader;
