import { Outlet } from 'react-router-dom';
import AdministrationGuard from './AdministrationGuard';

/**
 * Rutas anidadas (usuarios, roles, permisos, etc.) solo para los tres roles de administración.
 */
const AdministrationRoute = () => (
  <AdministrationGuard>
    <Outlet />
  </AdministrationGuard>
);

export default AdministrationRoute;
