import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import SecurityService from '../../services/securityService';
import { SESSION_INVALID_MESSAGE } from '../../constants/authMessages';

type Props = { children: React.ReactNode };

const AdministrationGuard = ({ children }: Props) => {
  const userFromStore = useSelector((s: RootState) => s.user.user);
  //const location = useLocation();

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



  return <>{children}</>;
};

export default AdministrationGuard;