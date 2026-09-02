import { useEffect, useState } from 'react';
import api from '../services/api';
import FieldError from './FieldError';

const HostDepartmentSelect = ({
  name = 'hostDepartment',
  value,
  onChange,
  onBlur,
  required = false,
  error = '',
}) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data || []);
      } catch {
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="form-group">
      <label className="form-label">Host Department</label>
      <select
        className={`form-control ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={loading || departments.length === 0}
      >
        <option value="">
          {loading ? 'Loading…' : departments.length === 0 ? 'No departments added yet' : 'Select department…'}
        </option>
        {departments.map((dept) => (
          <option key={dept._id} value={dept.name}>
            {dept.name}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
};

export default HostDepartmentSelect;
