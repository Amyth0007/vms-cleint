import { useEffect, useState } from 'react';
import api from '../services/api';
import FieldError from './FieldError';
import { rules } from '../utils/validation';

const emptyForm = { name: '' };

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments/manage');
      if (res.data.success) setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error fetching departments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setNameError('');
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setNameError('');
    setShowForm(true);
  };

  const openEdit = (dept) => {
    setEditingId(dept._id);
    setForm({ name: dept.name });
    setFormError('');
    setNameError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = rules.departmentName(form.name);
    setNameError(message);
    if (message) return;
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/departments/${editingId}`, form);
      } else {
        await api.post('/departments', form);
      }
      await load();
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department “${dept.name}”?`)) return;
    try {
      await api.delete(`/departments/${dept._id}`);
      if (editingId === dept._id) closeForm();
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="toolbar">
        <h3>Departments</h3>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => (showForm ? closeForm() : openAdd())}
        >
          {showForm ? 'Cancel' : 'Add department'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ maxWidth: 440 }}>
          <h3>{editingId ? 'Edit department' : 'Add department'}</h3>
          {formError && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{formError}</div>}
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }} autoComplete="off" noValidate>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${nameError ? 'is-invalid' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                placeholder="e.g. Computer Science"
              />
              <FieldError message={nameError} />
            </div>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save department'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {departments.length === 0 ? (
          <p className="muted">No departments yet. Add one to show it on visitor registration.</p>
        ) : (
          <>
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id}>
                    <td>{dept.name}</td>
                    <td>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEdit(dept)}>
                        Edit
                      </button>
                      {' '}
                      <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDelete(dept)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mobile-card-list">
              {departments.map((dept) => (
                <div key={dept._id} className="mobile-visit-card">
                  <div className="card-header">
                    <span className="name">{dept.name}</span>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEdit(dept)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDelete(dept)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentManager;
