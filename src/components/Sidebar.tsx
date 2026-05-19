import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Logo from '../images/logo/logo.svg';
import SidebarLinkGroup from './SidebarLinkGroup';

import type { RootState } from '../store/store';
import { hasAdministrationAccess } from '../constants/privilegedRoles';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const linkClass = (active: boolean) =>
  `block rounded-sm py-2 pl-6 pr-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
    active ? 'bg-graydark dark:bg-meta-4' : ''
  }`;

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { pathname } = useLocation();

  const user = useSelector((s: RootState) => s.user.user);
  const showAdminMenu = hasAdministrationAccess(user?.role);

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null
      ? false
      : storedSidebarExpanded === 'true',
  );

  // Cerrar sidebar al hacer click afuera
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;

      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      ) {
        return;
      }

      setSidebarOpen(false);
    };

    document.addEventListener('click', clickHandler);

    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;

      setSidebarOpen(false);
    };

    document.addEventListener('keydown', keyHandler);

    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Expandir sidebar
  useEffect(() => {
    localStorage.setItem(
      'sidebar-expanded',
      sidebarExpanded.toString(),
    );

    const body = document.querySelector('body');

    if (sidebarExpanded) {
      body?.classList.add('sidebar-expanded');
    } else {
      body?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* ADMINISTRACIÓN */}
          {showAdminMenu && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                ADMINISTRACIÓN
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/users"
                    className={linkClass(pathname.includes('users'))}
                  >
                    Usuarios
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/roles"
                    className={linkClass(pathname.includes('roles'))}
                  >
                    Roles
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/permission/list"
                    className={linkClass(
                      pathname.includes('permission'),
                    )}
                  >
                    Permisos
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/programaciones"
                    className={linkClass(
                      pathname.startsWith('/programaciones'),
                    )}
                  >
                    Programaciones
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/rutas"
                    className={linkClass(
                      pathname.startsWith('/rutas'),
                    )}
                  >
                    Rutas disponibles
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/paraderos/lista"
                    className={linkClass(
                      pathname.startsWith('/paraderos'),
                    )}
                  >
                    Paraderos
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/boletos/abordaje"
                    className={linkClass(
                      pathname.includes('/boletos/abordaje'),
                    )}
                  >
                   Boleto Abordaje
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/boletos/descenso"
                    className={linkClass(
                      pathname.includes('/boletos/descenso'),
                    )}
                  >
                    Boleto Descenso
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/buses"
                    className={linkClass(
                      pathname.includes('/buses'),
                    )}
                  >
                    Buses
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/conductores"
                    className={linkClass(
                      pathname.includes('/conductores'),
                    )}
                  >
                    Conductores
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/turnos"
                    className={linkClass(
                      pathname.includes('/turnos'),
                    )}
                  >
                    Turnos
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/empresas"
                    className={linkClass(
                      pathname.includes('/empresas'),
                    )}
                  >
                    Empresas
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/boletos/historial"
                    className={linkClass(
                      pathname.includes('/boletos/historial'),
                    )}
                  >
                    Boleto Historial
                  </NavLink>
                </li>
              </ul>

              {/* REPORTES */}
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                REPORTES
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/reportes/ingresopormetodo"
                    className={linkClass(
                      pathname ===
                        '/reportes/ingresopormetodo',
                    )}
                  >
                    Ingresos por Método
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/metodos-pago"
                    className={linkClass(
                      pathname ===
                        '/metodos-pago',
                    )}
                  >
                    Metodo de pago
                  </NavLink>
                </li>

                

                <li>
                  <NavLink
                    to="/reportes/distribucionetaria"
                    className={linkClass(
                      pathname ===
                        '/reportes/distribucionetaria',
                    )}
                  >
                    Distribución Etaria
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/reportes/tendenciaincidentes"
                    className={linkClass(
                      pathname ===
                        '/reportes/tendenciaincidentes',
                    )}
                  >
                    Tendencia de Incidentes
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          {/* OTHERS */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              OTHERS
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <NavLink
                  to="/recargas"
                  className={linkClass(
                    pathname.startsWith('/recargas'),
                  )}
                >
                  Recargar Tarjeta
                </NavLink>
              </li>

              {/* AUTH */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === '/auth' ||
                  pathname.includes('auth')
                }
              >
                {(handleClick, open) => (
                  <>
                    <NavLink
                      to="#"
                      className={`relative flex items-center justify-between rounded-sm py-2 pl-6 pr-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        pathname.includes('auth') &&
                        'bg-graydark dark:bg-meta-4'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();

                        sidebarExpanded
                          ? handleClick()
                          : setSidebarExpanded(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span>Authentication</span>
                      </div>

                      <svg
                        className={`transition-transform duration-200 ${
                          open && 'rotate-180'
                        }`}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          fill="currentColor"
                        />
                      </svg>
                    </NavLink>

                    <div className={!open ? 'hidden' : ''}>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                        <li>
                          <NavLink
                            to="/auth/signin"
                            className={({ isActive }) =>
                              `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                isActive ? '!text-white' : ''
                              }`
                            }
                          >
                            Sign In
                          </NavLink>
                        </li>

                        {showAdminMenu && (
                          <li>
                            <NavLink
                              to="/auth/signup"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white' : ''
                                }`
                              }
                            >
                              Sign Up
                            </NavLink>
                          </li>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;