import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import SecurityService from '../services/securityService';
import Logo from '../images/logo/logo-icon.svg';
import DarkModeSwitcher from './DarkModeSwitcher';
import DropdownMessage from './DropdownMessage';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';

function formatRolesForDisplay(roleCsv: string | undefined): string {
  if (!roleCsv?.trim()) {
    return 'Sin rol asignado';
  }
  return roleCsv
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .join(' · ');
}

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const userFromStore = useSelector((s: RootState) => s.user.user);
  const user = userFromStore ?? SecurityService.getUser();
  const roleDisplay = formatRolesForDisplay(user?.role);

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
        {/* --- Lado izquierdo del header (logo y buscador) --- */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && 'delay-400 !w-full'
                  }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-[0]'
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-200'
                  }`}
                ></span>
              </span>
            </span>
          </button>

          <Link className="block flex-shrink-0 lg:hidden" to="/">
            <img src={Logo} alt="Logo" />
          </Link>
        </div>

        {/* --- Buscador (sm+) y rol de sesión (siempre visible) --- */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <form
            action="#"
            method="POST"
            className="hidden max-w-md flex-1 sm:block"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pr-4 pl-9 focus:outline-none"
              />
            </div>
          </form>
          <div className="flex w-full min-w-0 max-w-[11rem] flex-shrink-0 flex-col gap-0 sm:max-w-[13rem]">
            <label
              htmlFor="header-session-role"
              className="text-[10px] font-medium leading-tight text-bodydark2 dark:text-bodydark"
            >
              Rol de la sesión
            </label>
            <input
              id="header-session-role"
              type="text"
              readOnly
              value={roleDisplay}
              title={roleDisplay}
              aria-readonly="true"
              className="h-7 w-full truncate rounded border border-stroke bg-gray px-2 py-0.5 text-xs leading-tight text-black shadow-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:placeholder:text-bodydark2"
            />
          </div>
        </div>

        {/* --- Lado derecho del header --- */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
            <DropdownNotification />
            <DropdownMessage />
          </ul>
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
