import { useState, useEffect } from 'react';
import api from '../services/api';

const ExpandableVisitCard = ({ visit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
      <div 
        className="card-header" 
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', marginBottom: isExpanded ? '0.5rem' : '0', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          <span className="name">{visit.visitor?.name}</span>
        </div>
        <span className={`badge badge-${visit.status}`}>
          {visit.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="card-row">
            <span className="label">Mobile</span>
            <span className="value">{visit.visitor?.mobile}</span>
          </div>
          <div className="card-row">
            <span className="label">Host</span>
            <span className="value">{visit.hostName || '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">Purpose</span>
            <span className="value">{visit.purpose || '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">By</span>
            <span className="value">{visit.registeredBy?.name || 'Self'}</span>
          </div>
          <div className="card-row">
            <span className="label">Checked-in</span>
            <span className="value">{visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : '-'}</span>
          </div>
          <div className="card-row">
            <span className="label">Checked-out</span>
            <span className="value">{visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString() : '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpandableGuardCard = ({ guard, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
      <div 
        className="card-header" 
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', marginBottom: isExpanded ? '0.5rem' : '0', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          <span className="name">{guard.name}</span>
        </div>
        <span className={`badge ${guard.isActive ? 'badge-completed' : 'badge-registered'}`}>
          {guard.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      {isExpanded && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="card-row">
            <span className="label">Email</span>
            <span className="value">{guard.email}</span>
          </div>
          <div className="card-row">
            <span className="label">Role</span>
            <span className="value">{guard.role.toUpperCase()}</span>
          </div>
          {guard.role !== 'admin' && (
            <div style={{ marginTop: '0.75rem' }} onClick={e => e.stopPropagation()}>
              <button 
                className="btn" 
                style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: guard.isActive ? 'var(--error)' : 'var(--success)' }}
                onClick={() => onToggle(guard._id)}
              >
                {guard.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('visits'); // 'visits' or 'guards'
  const [visits, setVisits] = useState([]);
  const [guards, setGuards] = useState([]);
  const [stats, setStats] = useState({ registered: 0, checkedIn: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [guardForm, setGuardForm] = useState({ name: '', email: '', password: '', role: 'guard' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showGuardPassword, setShowGuardPassword] = useState(false);
  const [guardFormLoading, setGuardFormLoading] = useState(false);
  const [guardTab, setGuardTab] = useState('view'); // 'view' or 'add'

  useEffect(() => {
    fetchData();
  }, [activeTab, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'visits') {
        const url = filterStatus ? `/visits?status=${filterStatus}` : '/visits';
        const response = await api.get(url);
        if (response.data.success) {
          setVisits(response.data.data);
          calculateStats(response.data.data);
        }
      } else if (activeTab === 'guards') {
        const response = await api.get('/auth/users');
        if (response.data.success) {
          setGuards(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitsList) => {
    let reg = 0, inCount = 0, comp = 0;
    visitsList.forEach(v => {
      if (v.status === 'registered') reg++;
      else if (v.status === 'checked_in') inCount++;
      else if (v.status === 'completed') comp++;
    });
    setStats({ registered: reg, checkedIn: inCount, completed: comp });
  };

  const handleGuardToggle = async (id) => {
    try {
      const response = await api.patch(`/auth/users/${id}/toggle`);
      if (response.data.success) {
        setGuards(guards.map(g => g._id === id ? { ...g, isActive: response.data.data.isActive } : g));
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleGuardSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setGuardFormLoading(true);
    try {
      const response = await api.post('/auth/users', guardForm);
      if (response.data.success) {
        setFormSuccess('Security guard registered successfully!');
        setGuardForm({ name: '', email: '', password: '', role: 'guard' });
        const res = await api.get('/auth/users');
        if (res.data.success) setGuards(res.data.data);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setGuardFormLoading(false);
    }
  };

  return (
    <div>
      <h2>Admin Control Center</h2>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h4>Registered Visits</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.registered}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h4>Currently Checked In</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.checkedIn}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h4>Completed Visits</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.completed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button 
          className="btn" 
          style={{ backgroundColor: activeTab === 'visits' ? 'var(--primary-color)' : 'var(--text-light)' }}
          onClick={() => { setActiveTab('visits'); setFilterStatus(''); }}
        >
          Visits Log
        </button>
        <button 
          className="btn" 
          style={{ backgroundColor: activeTab === 'guards' ? 'var(--primary-color)' : 'var(--text-light)' }}
          onClick={() => setActiveTab('guards')}
        >
          Manage Guards
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === 'visits' ? (
        <div>
          <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>All Visits Log</h3>
            <div>
              <label style={{ marginRight: '0.5rem' }}>Filter:</label>
              <select 
                className="form-control" 
                style={{ display: 'inline-block', width: 'auto', padding: '0.25rem 0.5rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="registered">Registered</option>
                <option value="checked_in">Checked In</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="card">
            {visits.length === 0 ? (
              <p>No visits found.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <table className="desktop-table">
                  <thead>
                    <tr>
                      <th>Visitor Name</th>
                      <th>Mobile</th>
                      <th>Host</th>
                      <th>Purpose</th>
                      <th>Registered By</th>
                      <th>Status</th>
                      <th>Checked-in At</th>
                      <th>Checked-out At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map(visit => (
                      <tr key={visit._id}>
                        <td>{visit.visitor?.name}</td>
                        <td>{visit.visitor?.mobile}</td>
                        <td>{visit.hostName || '-'}</td>
                        <td>{visit.purpose || '-'}</td>
                        <td>{visit.registeredBy?.name || 'Self'}</td>
                        <td>
                          <span className={`badge badge-${visit.status}`}>
                            {visit.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>{visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : '-'}</td>
                        <td>{visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="mobile-card-list">
                  {visits.map(visit => (
                    <ExpandableVisitCard key={visit._id} visit={visit} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Sub-tabs for Guard Management */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <button 
              className="btn" 
              onClick={() => setGuardTab('view')}
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.875rem', 
                backgroundColor: guardTab === 'view' ? 'var(--primary-color)' : '#e5e7eb',
                color: guardTab === 'view' ? 'white' : 'var(--text-main)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📋 View Guards
            </button>
            <button 
              className="btn" 
              onClick={() => setGuardTab('add')}
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.875rem', 
                backgroundColor: guardTab === 'add' ? 'var(--primary-color)' : '#e5e7eb',
                color: guardTab === 'add' ? 'white' : 'var(--text-main)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ➕ Add Guard
            </button>
          </div>

          {guardTab === 'add' ? (
            /* Add Guard Form */
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <h3>Add New Guard</h3>
              {formError && <div className="alert alert-error" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>{formError}</div>}
              {formSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>{formSuccess}</div>}
              <form onSubmit={handleGuardSubmit} style={{ marginTop: '1rem' }} autoComplete="off">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={guardForm.name} 
                    onChange={e => setGuardForm({ ...guardForm, name: e.target.value })} 
                    required 
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={guardForm.email} 
                    onChange={e => setGuardForm({ ...guardForm, email: e.target.value })} 
                    required 
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showGuardPassword ? 'text' : 'password'} 
                      className="form-control" 
                      value={guardForm.password} 
                      onChange={e => setGuardForm({ ...guardForm, password: e.target.value })} 
                      required 
                      style={{ paddingRight: '2.5rem' }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuardPassword(!showGuardPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label={showGuardPassword ? 'Hide password' : 'Show password'}
                    >
                      {showGuardPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }} disabled={guardFormLoading}>
                  {guardFormLoading ? 'Adding...' : 'Add Guard'}
                </button>
              </form>
            </div>
          ) : (
            /* Guards List */
            <div className="card">
              <h3>Guards List</h3>
              
              {/* Desktop Table */}
              <table className="desktop-table" style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.map(guard => (
                    <tr key={guard._id}>
                      <td>{guard.name}</td>
                      <td>{guard.email}</td>
                      <td>
                        <span className={`badge ${guard.isActive ? 'badge-completed' : 'badge-registered'}`}>
                          {guard.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {guard.role !== 'admin' && (
                          <button 
                            className="btn" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', backgroundColor: guard.isActive ? 'var(--error)' : 'var(--success)' }}
                            onClick={() => handleGuardToggle(guard._id)}
                          >
                            {guard.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="mobile-card-list" style={{ marginTop: '1rem' }}>
                {guards.map(guard => (
                  <ExpandableGuardCard key={guard._id} guard={guard} onToggle={handleGuardToggle} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
