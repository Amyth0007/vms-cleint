import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { triggerHealthCheck } from '../services/api';

const WARM_PATHS = ['/', '/login', '/register'];

const ApiWakeup = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const shouldForce = WARM_PATHS.includes(pathname);
    triggerHealthCheck(shouldForce);
  }, [pathname]);

  return null;
};

export default ApiWakeup;
