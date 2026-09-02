import { useState, useEffect } from 'react';
import api from '../services/api';
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

const validate = (formData, passMode, passId) => {
  const errors = {
    name: rules.name(formData.name),
    mobile: rules.mobile(formData.mobile),
    purpose: rules.purpose(formData.purpose),
    hostName: rules.hostName(formData.hostName),
    hostDepartment: rules.department(formData.hostDepartment),
  };
  if (passMode === 'pass' && !passId) errors.passId = 'Select a physical pass';
  return errors;
};

const RegisterVisitor = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [passMode, setPassMode] = useState('phone');
  const [availablePasses, setAvailablePasses] = useState([]);
  const [passId, setPassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const res = await api.get('/passes/available');
        if (res.data.success) setAvailablePasses(res.data.data);
      } catch {
        setAvailablePasses([]);
      }
    };
    loadPasses();
  }, [result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const next = { ...fieldErrors, [name]: rules[name] ? rules[name](value) : '' };
    if (name === 'hostDepartment') next.hostDepartment = rules.department(value);
    setFieldErrors(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(formData, passMode, passId);
    setFieldErrors(errors);
    const summary = firstError(errors);
    if (summary) {
      setError(summary);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = { ...formData, mobile: formData.mobile.replace(/\D/g, '') };
      if (passMode === 'pass') payload.passId = passId;
      const response = await api.post('/visits/register', payload);
      if (response.data.success) {
        setResult(response.data.data);
        setFormData(emptyForm);
        setPassId('');
        setFieldErrors({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setLoading(false);
    }
  };

  const assignedPass = result?.pass;

  return (
    <div className="form-page">
      <h2 className="page-title">Register visitor</h2>
      <p className="page-sub">Phone QR or a numbered pass for the gate</p>

      {result ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Visitor registered</h3>
          {assignedPass ? (
            <>
              <p>Hand physical card <strong>{assignedPass.code}</strong> to the visitor.</p>
              <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Scan this same card at entry and exit.</p>
              <div className="pass-code" style={{ fontSize: '2rem', margin: '0.75rem 0' }}>{assignedPass.code}</div>
              <img src={assignedPass.qrCode || result.qrCode} alt={assignedPass.code} style={{ maxWidth: '220px', margin: '0.5rem auto' }} />
            </>
          ) : (
            <>
              <p>Share this QR code with the visitor (phone).</p>
              <img src={result.qrCode} alt="Visit QR Code" style={{ maxWidth: '250px', margin: '1rem auto' }} />
            </>
          )}
          <div>
            <button className="btn" onClick={() => setResult(null)}>Register another visitor</button>
          </div>
        </div>
      ) : (
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Pass type</label>
              <div className="segmented">
                <button type="button" className={passMode === 'phone' ? 'active' : ''} onClick={() => setPassMode('phone')}>
                  Phone QR
                </button>
                <button type="button" className={passMode === 'pass' ? 'active' : ''} onClick={() => setPassMode('pass')}>
                  Physical pass
                </button>
              </div>
            </div>

            {passMode === 'pass' && (
              <div className="form-group">
                <label className="form-label">Available pass</label>
                {availablePasses.length === 0 ? (
                  <p style={{ color: 'var(--error)' }}>No free passes. Use Phone QR, or ask admin to generate more.</p>
                ) : (
                  <select
                    className={`form-control ${fieldErrors.passId ? 'is-invalid' : ''}`}
                    value={passId}
                    onChange={(e) => {
                      setPassId(e.target.value);
                      setFieldErrors({ ...fieldErrors, passId: '' });
                    }}
                  >
                    <option value="">Select pass…</option>
                    {availablePasses.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.code} · used {p.useCount} time{p.useCount === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                )}
                <FieldError message={fieldErrors.passId} />
              </div>
            )}

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
              <input type="text" className={`form-control ${fieldErrors.purpose ? 'is-invalid' : ''}`} name="purpose" value={formData.purpose} onChange={handleChange} onBlur={handleBlur} />
              <FieldError message={fieldErrors.purpose} />
            </div>
            <div className="form-group">
              <label className="form-label">Host name</label>
              <input type="text" className={`form-control ${fieldErrors.hostName ? 'is-invalid' : ''}`} name="hostName" value={formData.hostName} onChange={handleChange} onBlur={handleBlur} />
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

            <button
              type="submit"
              className="btn"
              style={{ width: '100%' }}
              disabled={loading || (passMode === 'pass' && availablePasses.length === 0)}
            >
              {loading ? 'Registering…' : passMode === 'pass' ? 'Assign pass' : 'Register'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterVisitor;
