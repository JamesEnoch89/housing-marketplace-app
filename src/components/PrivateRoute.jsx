import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <div>Loading...</div>;
  }

  return loggedIn ? <Outlet /> : <Navigate to="/sign-in"></Navigate>;
};

export default PrivateRoute;
