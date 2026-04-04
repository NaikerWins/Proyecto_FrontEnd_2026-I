import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { hasAdministrationAccess } from '../../constants/privilegedRoles';
import SecurityService from '../../services/securityService';
import { SESSION_INVALID_MESSAGE } from '../../constants/authMessages';

type Props = { children: React.ReactNode };

/**
 * Solo Administrador Sistema, Administrador Empresa y Supervisor.
 * Sin sesión → login; con sesión y otro rol → /unauthorized.
 */
const AdministrationGuard = ({ children }: Props) => {
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
        to="/auth/signup"
        replace
        state={{ message: SESSION_INVALID_MESSAGE }}
      />
    );
  }

  if (!hasAdministrationAccess(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, reason: 'administration' }}
      />
    );
  }

  return <>{children}</>;
};

export default AdministrationGuard;
