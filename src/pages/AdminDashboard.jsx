import { useState, useEffect } from 'react';
import api from '../services/api';
import ProcessVisitModal from '../components/ProcessVisitModal';
import PasswordToggle from '../components/PasswordToggle';
import VisitLog from '../components/VisitLog';
import DepartmentManager from '../components/DepartmentManager';
import FieldError from '../components/FieldError';
import { rules, firstError } from '../utils/validation';
import PageHeader from '../components/PageHeader';

const ExpandableGuardCard = ({ guard, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mobile-visit-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="card-header">
        <span className="name">{guard.name}</span>
        <span className={`badge ${guard.isActive ? 'badge-completed' : 'badge-registered'}`}>
          {guard.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      {isExpanded && (
        <div>
          <div className="card-row"><span className="label">Email</span><span className="value">{guard.email}</span></div>
          {guard.role !== 'admin' && (
            <div style={{ marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={`btn btn-sm ${guard.isActive ? 'btn-soft-danger' : 'btn-soft-success'}`}
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
  const [activeTab, setActiveTab] = useState('visits');
  const [guards, setGuards] = useState([]);
  const [loadingGuards, setLoadingGuards] = useState(false);
  const [guardForm, setGuardForm] = useState({ name: '', email: '', password: '', role: 'guard' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showGuardPassword, setShowGuardPassword] = useState(false);
  const [guardFormLoading, setGuardFormLoading] = useState(false);
  const [showAddGuard, setShowAddGuard] = useState(false);
  const [guardFields, setGuardFields] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [logTick, setLogTick] = useState(0);

  useEffect(() => {
    if (activeTab !== 'guards') return;
    const loadGuards = async () => {
      setLoadingGuards(true);
      try {
        const response = await api.get('/auth/users');
        if (response.data.success) setGuards(response.data.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoadingGuards(false);
      }
    };
    loadGuards();
  }, [activeTab]);

  const handleGuardToggle = async (id) => {
    try {
      const response = await api.patch(`/auth/users/${id}/toggle`);
      if (response.data.success) {
        setGuards(guards.map((g) => (g._id === id ? { ...g, isActive: response.data.data.isActive } : g)));
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleGuardSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      name: rules.name(guardForm.name),
      email: rules.email(guardForm.email),
      password: rules.password(guardForm.password),
    };
    setGuardFields(errors);
    const summary = firstError(errors);
    if (summary) {
      setFormError(summary);
      return;
    }
    setFormError('');
    setFormSuccess('');
    setGuardFormLoading(true);
    try {
      const response = await api.post('/auth/users', guardForm);
      if (response.data.success) {
        setFormSuccess('Guard added');
        setGuardForm({ name: '', email: '', password: '', role: 'guard' });
        const res = await api.get('/auth/users');
        if (res.data.success) setGuards(res.data.data);
        setShowAddGuard(false);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setGuardFormLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Operations"
        subtitle="Visits, staff accounts, and host departments."
      />

      <div className="tabs">
        <button type="button" className={`tab ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => setActiveTab('visits')}>
          Visits
        </button>
        <button type="button" className={`tab ${activeTab === 'guards' ? 'active' : ''}`} onClick={() => { setActiveTab('guards'); setShowAddGuard(false); }}>
          Guards
        </button>
        <button type="button" className={`tab ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>
          Departments
        </button>
      </div>

      {activeTab === 'visits' && (
        <VisitLog onProcess={setProcessingId} refreshKey={logTick} />
      )}

      {activeTab === 'departments' && <DepartmentManager />}

      {activeTab === 'guards' && (loadingGuards ? (
        <p className="muted">Loading…</p>
      ) : (
        <div>
          <div className="toolbar">
            <h3>Guards</h3>
            <button type="button" className="btn btn-sm" onClick={() => { setShowAddGuard((v) => !v); setFormError(''); setFormSuccess(''); }}>
              {showAddGuard ? 'Cancel' : 'Add guard'}
            </button>
          </div>

          {showAddGuard && (
            <div className="card" style={{ maxWidth: 440 }}>
              <h3>Add guard</h3>
              {formError && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{formError}</div>}
              {formSuccess && <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>{formSuccess}</div>}
              <form onSubmit={handleGuardSubmit} style={{ marginTop: '1rem' }} autoComplete="off" noValidate>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className={`form-control ${guardFields.name ? 'is-invalid' : ''}`} value={guardForm.name} onChange={(e) => setGuardForm({ ...guardForm, name: e.target.value })} autoComplete="off" />
                  <FieldError message={guardFields.name} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className={`form-control ${guardFields.email ? 'is-invalid' : ''}`} value={guardForm.email} onChange={(e) => setGuardForm({ ...guardForm, email: e.target.value })} autoComplete="off" />
                  <FieldError message={guardFields.email} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showGuardPassword ? 'text' : 'password'}
                      className={`form-control ${guardFields.password ? 'is-invalid' : ''}`}
                      value={guardForm.password}
                      onChange={(e) => setGuardForm({ ...guardForm, password: e.target.value })}
                      required
                      style={{ paddingRight: '2.75rem' }}
                      autoComplete="new-password"
                    />
                    <PasswordToggle visible={showGuardPassword} onToggle={() => setShowGuardPassword(!showGuardPassword)} />
                  </div>
                  <FieldError message={guardFields.password} />
                </div>
                <button type="submit" className="btn" disabled={guardFormLoading}>
                  {guardFormLoading ? 'Adding…' : 'Save guard'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {guards.map((guard) => (
                  <tr key={guard._id}>
                    <td>{guard.name}</td>
                    <td className="col-secondary">{guard.email}</td>
                    <td>
                      <span className={`badge ${guard.isActive ? 'badge-completed' : 'badge-registered'}`}>
                        {guard.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {guard.role !== 'admin' && (
                        <button
                          type="button"
                          className={`btn btn-sm ${guard.isActive ? 'btn-soft-danger' : 'btn-soft-success'}`}
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
            <div className="mobile-card-list">
              {guards.map((guard) => (
                <ExpandableGuardCard key={guard._id} guard={guard} onToggle={handleGuardToggle} />
              ))}
            </div>
          </div>
        </div>
      ))}

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

export default AdminDashboard;
