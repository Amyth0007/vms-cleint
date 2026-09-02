const digits = (value) => String(value || '').replace(/\D/g, '');

export const rules = {
  name: (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Enter a full name';
    if (text.length < 2) return 'Name must be at least 2 characters';
    if (text.length > 80) return 'Name is too long';
    if (!/^[a-zA-Z .'-]+$/.test(text)) return 'Use letters only in the name';
    return '';
  },
  email: (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Enter an email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Enter a valid email address';
    return '';
  },
  password: (value, min = 6) => {
    if (!value) return 'Enter a password';
    if (String(value).length < min) return `Password must be at least ${min} characters`;
    return '';
  },
  mobile: (value) => {
    const phone = digits(value);
    if (!phone) return 'Enter a mobile number';
    if (phone.length < 10 || phone.length > 15) return 'Mobile number must be 10–15 digits';
    if (phone.length === 10 && !/^[6-9]/.test(phone)) return '10-digit numbers should start with 6–9';
    return '';
  },
  purpose: (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Enter the purpose of visit';
    if (text.length < 3) return 'Purpose must be at least 3 characters';
    return '';
  },
  hostName: (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    if (text.length < 2) return 'Host name must be at least 2 characters';
    return '';
  },
  department: (value) => {
    if (!String(value || '').trim()) return 'Select a host department';
    return '';
  },
  departmentName: (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Enter a department name';
    if (text.length < 2) return 'Name must be at least 2 characters';
    if (text.length > 80) return 'Name must be 80 characters or less';
    return '';
  },
  searchQuery: (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Enter a name or mobile number';
    if (text.length < 2) return 'Type at least 2 characters';
    return '';
  },
};

export const firstError = (errors) => Object.values(errors).find(Boolean) || '';
