import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PublicRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    visitorType: 'other',
    purpose: '',
    hostName: '',
    hostDepartment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQrCodeData(null);

    try {
      const response = await api.post('/visits/public-register', formData);
      if (response.data.success) {
        setQrCodeData(response.data.data.qrCode);
        setFormData({
          name: '', mobile: '', visitorType: 'other', purpose: '', hostName: '', hostDepartment: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Visitor Self-Registration</h2>
        <Link to="/login" className="btn" style={{ backgroundColor: 'var(--text-light)', padding: '0.5rem 1rem' }}>
          Staff Login
        </Link>
      </div>
      
      {qrCodeData ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Registration Successful!</h3>
          <p style={{ marginBottom: '1rem' }}>Please take a screenshot or photo of this QR code. Present it to the guard at the gate for Check-In and Check-Out.</p>
          <img src={qrCodeData} alt="Visit QR Code" style={{ maxWidth: '250px', width: '100%', margin: '0 auto', display: 'block' }} />
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn" style={{ width: '100%' }} onClick={() => setQrCodeData(null)}>Register Another Visit</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            Register your visit details below to generate a QR pass before entering the campus.
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Visitor Type</label>
              <select className="form-control" name="visitorType" value={formData.visitorType} onChange={handleChange}>
                <option value="parent">Parent</option>
                <option value="vendor">Vendor</option>
                <option value="official">Official</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purpose of Visit</label>
              <input type="text" className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="e.g. Meet Professor, Delivery" required />
            </div>
            <div className="form-group">
              <label className="form-label">Host Name</label>
              <input type="text" className="form-control" name="hostName" value={formData.hostName} onChange={handleChange} placeholder="Who are you meeting?" />
            </div>
            <div className="form-group">
              <label className="form-label">Host Department</label>
              <input type="text" className="form-control" name="hostDepartment" value={formData.hostDepartment} onChange={handleChange} placeholder="e.g. CSE, Admin" />
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Generating QR Code...' : 'Generate Entry QR Pass'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PublicRegister;
