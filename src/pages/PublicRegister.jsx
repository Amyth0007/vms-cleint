import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { triggerHealthCheck } from '../services/api';
import HostDepartmentSelect from '../components/HostDepartmentSelect';
import FieldError from '../components/FieldError';
import { rules, firstError } from '../utils/validation';

const emptyForm = {
  name: '',
  mobile: '',
  visitorType: 'other',
  purpose: '',
  hostName: '',
  hostDepartment: '',
};

const PublicRegister = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    triggerHealthCheck(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const message = name === 'hostDepartment' ? rules.department(value) : rules[name] ? rules[name](value) : '';
    setFieldErrors({ ...fieldErrors, [name]: message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      name: rules.name(formData.name),
      mobile: rules.mobile(formData.mobile),
      purpose: rules.purpose(formData.purpose),
      hostName: rules.hostName(formData.hostName),
      hostDepartment: rules.department(formData.hostDepartment),
    };
    setFieldErrors(errors);
    const summary = firstError(errors);
    if (summary) {
      setError(summary);
      return;
    }

    setLoading(true);
    setError('');
    setQrCodeData(null);

    try {
      const response = await api.post('/visits/public-register', {
        ...formData,
        mobile: formData.mobile.replace(/\D/g, ''),
      });
      if (response.data.success) {
        setQrCodeData(response.data.data.qrCode);
        setFormData(emptyForm);
        setFieldErrors({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper form-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: 0 }}>Visitor registration</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>Get a QR pass before you arrive</p>
        </div>
        <Link to="/login" className="btn-link">Staff login</Link>
      </div>

      {qrCodeData ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Registration successful</h3>
          <p style={{ marginBottom: '1rem' }}>Screenshot this QR. Show it at the gate for check-in and check-out.</p>
          <img src={qrCodeData} alt="Visit QR Code" style={{ maxWidth: '250px', width: '100%', margin: '0 auto', display: 'block' }} />
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn" style={{ width: '100%' }} onClick={() => setQrCodeData(null)}>Register another visit</button>
          </div>
        </div>
      ) : (
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input type="text" className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`} name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} autoComplete="name" />
              <FieldError message={fieldErrors.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile number</label>
              <input type="tel" inputMode="numeric" className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`} name="mobile" value={formData.mobile} onChange={handleChange} onBlur={handleBlur} autoComplete="tel" />
              <FieldError message={fieldErrors.mobile} />
            </div>
            <div className="form-group">
              <label className="form-label">Visitor type</label>
              <select className="form-control" name="visitorType" value={formData.visitorType} onChange={handleChange}>
                <option value="parent">Parent</option>
                <option value="vendor">Vendor</option>
                <option value="official">Official</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purpose of visit</label>
              <input type="text" className={`form-control ${fieldErrors.purpose ? 'is-invalid' : ''}`} name="purpose" value={formData.purpose} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Meet professor" />
              <FieldError message={fieldErrors.purpose} />
            </div>
            <div className="form-group">
              <label className="form-label">Host name</label>
              <input type="text" className={`form-control ${fieldErrors.hostName ? 'is-invalid' : ''}`} name="hostName" value={formData.hostName} onChange={handleChange} onBlur={handleBlur} placeholder="Who are you meeting?" />
              <FieldError message={fieldErrors.hostName} />
            </div>
            <HostDepartmentSelect
              name="hostDepartment"
              value={formData.hostDepartment}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={fieldErrors.hostDepartment}
            />

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Generating QR…' : 'Generate entry QR'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PublicRegister;
