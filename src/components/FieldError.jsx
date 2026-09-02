const FieldError = ({ message }) =>
  message ? <p className="field-error">{message}</p> : null;

export default FieldError;
