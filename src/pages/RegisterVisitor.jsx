import { useState } from 'react';
import api from '../services/api';

const RegisterVisitor = () => {
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
      const response = await api.post('/visits/register', formData);
      if (response.data.success) {
        setQrCodeData(response.data.data.qrCode);
        setFormData({
          name: '', mobile: '', visitorType: 'other', purpose: '', hostName: '', hostDepartment: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Register Visitor</h2>
      
      {qrCodeData ? (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Visitor Registered Successfully!</h3>
          <p>Please share this QR code with the visitor.</p>
          <img src={qrCodeData} alt="Visit QR Code" style={{ maxWidth: '250px', margin: '1rem auto' }} />
          <div>
            <button className="btn" onClick={() => setQrCodeData(null)}>Register Another Visitor</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} required />
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
              <input type="text" className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Host Name</label>
              <input type="text" className="form-control" name="hostName" value={formData.hostName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Host Department</label>
              <input type="text" className="form-control" name="hostDepartment" value={formData.hostDepartment} onChange={handleChange} />
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register Visitor'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterVisitor;
