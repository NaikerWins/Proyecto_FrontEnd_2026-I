import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { hasAdministrationAccess } from "../../constants/privilegedRoles";

type Props = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

const RoleGate = ({ children, adminOnly = false }: Props) => {
  const user = useSelector((s: RootState) => s.user.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/auth/signin"
        replace
        state={{ message: "Sesión expirada o inválida" }}
      />
    );
  }

  if (adminOnly && !hasAdministrationAccess(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RoleGate;
