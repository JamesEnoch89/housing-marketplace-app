import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import Spinner from './Spinner';

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return loggedIn ? <Outlet /> : <Navigate to="/sign-in"></Navigate>;
};

export default PrivateRoute;
