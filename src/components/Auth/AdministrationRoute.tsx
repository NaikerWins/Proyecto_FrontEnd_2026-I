import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { hasAdministrationAccess } from '../../constants/privilegedRoles';
import SecurityService from '../../services/securityService';
import { SESSION_INVALID_MESSAGE } from '../../constants/authMessages';

/**
 * Solo Administrador Sistema, Administrador Empresa y Supervisor.
 * El resto se redirige al dashboard (inicio).
 * Requiere sesión completa (usuario + JWT), no solo estado en Redux.
 */
const AdministrationRoute = () => {
  const userFromStore = useSelector((s: RootState) => s.user.user);
  const location = useLocation();

  if (!SecurityService.isAuthenticated()) {
    return (
      <Navigate
        to="/auth/signin"
        replace
        state={{ message: SESSION_INVALID_MESSAGE }}
      />
    );
  }

  const user = userFromStore ?? SecurityService.getUser();
  if (!user) {
    return (
      <Navigate
        to="/auth/signin"
        replace
        state={{ message: SESSION_INVALID_MESSAGE }}
      />
    );
  }

  if (!hasAdministrationAccess(user.role)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdministrationRoute;
