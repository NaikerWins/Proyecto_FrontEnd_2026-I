import { lazy } from 'react';
import ListUsers from '../pages/Users/List';
import CreateUser from '../pages/Users/Create';
import UpdateUser from '../pages/Users/Update';
import UpdateProfile from '../pages/Profiles/Update';
import ListPermissions from '../pages/Permission/List';
import createProfiles from '../pages/Profiles/Create';
import SecurityQuestionList from '../pages/SecurityQuestion/SecurityQuestionList';
import SecurityQuestionForm from '../pages/SecurityQuestion/SecurityQuestionForm';
import ListProfile from '../pages/Profiles/List';
import RolePermissionPage from '../pages/RolePermission/list';
import AnswerList from '../pages/Answers/AnswerList';
import CompleteProfile from '../pages/Authentication/CompleteProfile';
import AnswerForm from '../pages/Answers/AnswerForm';
import DeviceList from '../pages/devices/DeviceList';
import DeviceForm from '../pages/devices/DeviceForm';
import SessionList from '../pages/Sessions/SessionsList';
import SessionForm from '../pages/Sessions/SessionForm';
import ListProgramaciones from '../pages/Programaciones/List';
import FormProgramacion from '../pages/Programaciones/Form';
import RecargaTarjeta from '../pages/Recargas/RecargaTarjeta';
import ConfirmacionRecarga from '../pages/Recargas/ConfirmacionRecarga';
import IngresosPorMetodo from '../pages/Reportes/IngresosPorMetodo';
import DistribucionEtaria from '../pages/Reportes/DistribucionEtaria';
import TendenciaIncidentes from '../pages/Reportes/TendenciaIncidentes';
import SeguimientoRuta from '../pages/Monitoreo/SeguimientoRuta';
import PanelSupervisor from '../pages/Monitoreo/PanelSupervisor';
import ActivarNotificacion from '../pages/Monitoreo/ActivarNotificacion';
import ConfiguracionClima from '../pages/Monitoreo/ConfiguracionClima';
import Horarios from '../pages/Programaciones/Horarios';

const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo = lazy(() => import('../pages/Demo'));
const DigitalSignatureList = lazy(
  () => import('../pages/DigitalSignature/DigSigList'),
);
const DigitalSignatureForm = lazy(
  () => import('../pages/DigitalSignature/DigSigForm'),
);

const ListRoles = lazy(() => import('../pages/Roles/List'));
const CreateRole = lazy(() => import('../pages/Roles/Create'));
const UpdateRole = lazy(() => import('../pages/Roles/Update'));
const UserRolesList = lazy(() => import('../pages/UserRoles/List'));
const AssignRole = lazy(() => import('../pages/UserRoles/AssignRole'));


const UserPasswordsList = lazy(() => import('../pages/Passwords/List'));
const CreatePassword = lazy(() => import('../pages/Passwords/Create'));
const ListAddresses = lazy(() => import('../pages/addresses/List'));
const CreateAddress = lazy(() => import('../pages/addresses/Create'));
const UpdateAddress = lazy(() => import('../pages/addresses/Update'));

const ListBuses = lazy(() => import('../pages/Buses/list'));
const CreateBus = lazy(() => import('../pages/Buses/create'));
const UpdateBus = lazy(() => import('../pages/Buses/update'));

const ListParaderos = lazy(() => import('../pages/Paraderos/list'));
const CreateParadero = lazy(() => import('../pages/Paraderos/create'));


const ListIncidentes = lazy(() => import('../pages/Incidentes/list'));
const CreateIncidente = lazy(() => import('../pages/Incidentes/create'));
const DetailIncidente = lazy(() => import('../pages/Incidentes/detail'));

const ListEmpresas = lazy(() => import('../pages/Empresas/list'));
const CreateEmpresa = lazy(() => import('../pages/Empresas/create'));
const UpdateEmpresa = lazy(() => import('../pages/Empresas/update'));

const ListTurnos = lazy(() => import('../pages/Turnos/list'));
const CreateTurno = lazy(() => import('../pages/Turnos/create'));

const ListRutas = lazy(() =>  import('../pages/Rutas/list'));
const CreateRuta = lazy(() => import('../pages/Rutas/create'));
const DetailRuta = lazy(() => import('../pages/Rutas/detail'));

const ListConductores = lazy(() => import('../pages/Conductores/list'));
const CreateConductor = lazy(() => import('../pages/Conductores/create'));
const UpdateConductor = lazy(() => import('../pages/Conductores/update'));

/** Gestión de usuarios, roles y permisos (solo roles de administración en backend). */
export const administrationRoutes = [
  {
  path: '/panel',
  title: 'Panel de Control de Flota',
  component: PanelSupervisor,
},
  {
    path: '/RolePermission/list',
    title: 'list RolePermission',
    component: RolePermissionPage,
  },

  {
    path: '/permission/list',
    title: 'LIST permission',
    component: ListPermissions,
  },
  {
    path: '/roles',
    title: 'Roles List',
    component: ListRoles,
  },
  {
    path: '/roles/crear',
    title: 'Create Role',
    component: CreateRole,
  }
  ,
  {
    path: '/roles/editar/:id',
    title: 'Update Role',
    component: UpdateRole,
  },
  

  {
    path: '/empresas',
    title: 'Empresas List',
    component: ListEmpresas,
  },
  {
    path: '/empresas/crear',
    title: 'Create Empresa',
    component: CreateEmpresa,
  },
  {
    path: '/empresas/editar/:id',
    title: 'Update Empresa',
    component: UpdateEmpresa,
  },
  {
    path: '/user-roles/:userId',
    title: 'User Roles',
    component: UserRolesList,
  },
  {
    path: '/user-roles/:userId/asignar',
    title: 'Assign Role',
    component: AssignRole,
  },
  {
    path: '/users/editar/:id',
    title: 'Update Users',
    component: UpdateUser,
  },
  {
    path: '/users/crear',
    title: 'Create Users',
    component: CreateUser,
  },
  {
    path: '/users',
    title: 'Users List',
    component: ListUsers,
  },
  { path: '/programaciones', 
    title: 'Programaciones', 
    component: ListProgramaciones },

  { path: '/programaciones/create', 
    title: 'Crear Programacion', 
    component: FormProgramacion },

  {
    path: '/reportes/ingresopormetodo',
    title: 'Ingresos por Método de Pago',
    component: IngresosPorMetodo,
  },

  {
    path: '/reportes/distribucionetaria',
    title: 'Distribución Etaria',
    component: DistribucionEtaria,
  },

  {
    path: '/reportes/tendenciaincidentes',
    title: 'Tendencia de Incidentes',
    component: TendenciaIncidentes,
  },
];


export const generalRoutes = [
  {
  path: '/monitoreo/ruta/:rutaId',
  title: 'Seguimiento de Ruta',
  component: SeguimientoRuta,
},
{
  path: '/notificacion/bus',
  title: 'Notificación de Bus Cercano',
  component: ActivarNotificacion,
},
{
  path: '/perfil/clima',
  title: 'Configuración de Clima',
  component: ConfiguracionClima,
},
  { 
    path: '/buses', 
    title: 'Buses List', 
    component: ListBuses 
  },
  { 
    path: '/buses/crear', 
    title: 'Create Bus', 
    component: CreateBus 
  },
  { 
    path: '/buses/editar/:id', 
    title: 'Update Bus', 
    component: UpdateBus 
  },
  { 
    path: '/conductores', 
    title: 'Conductores List', 
    component: ListConductores 
  },
  { 
    path: '/conductores/crear', 
    title: 'Create Conductor', 
    component: CreateConductor 
  },
  { 
    path: '/conductores/editar/:id', 
    title: 'Update Conductor', 
    component: UpdateConductor 
  },
  { 
    path: '/paraderos', 
    title: 'Paraderos List', 
    component: ListParaderos 
  },
  { 
    path: '/paraderos/crear', 
    title: 'Create Paradero', 
    component: CreateParadero 
  },
  { 
    path: '/incidentes/bus/:busId', 
    title: 'Incidentes Bus', 
    component: ListIncidentes 
  },
  { 
    path: '/incidentes/crear/:busId', 
    title: 'Create Incidente', 
    component: CreateIncidente 
  },
  { 
    path: '/incidentes/:id', 
    title: 'Detail Incidente', 
    component: DetailIncidente 
  },
  { 
    path: '/turnos', 
    title: 'Turnos List', 
    component: ListTurnos 
  },
  { 
    path: '/turnos/crear', 
    title: 'Create Turno', 
    component: CreateTurno 
  },
  { 
    path: '/rutas', 
    title: 'Rutas List', 
    component: ListRutas 
  },
  { 
    path: '/rutas/crear', 
    title: 'Create Ruta', 
    component: CreateRuta 
  },
  { 
    path: '/rutas/:id', 
    title: 'Detail Ruta', 
    component: DetailRuta 
  },
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
  },
  {
    path: '/profiles/update',
    title: 'Update Profile',
    component: UpdateProfile,
  },
  {
    path: '/profiles/list',
    title: 'list Profile',
    component: ListProfile,
  },
  {
    path: '/auth/complete-profile',
    title: 'Complete Profile',
    component: CompleteProfile,
  },
  {
    path: '/passwords/:userId',
    title: 'User Passwords',
    component: UserPasswordsList,
  },
  {
    path: '/profiles/create',
    title: 'Create Profile',
    component: createProfiles,
  },
  {
    path: '/passwords/:userId/crear',
    title: 'Create Password',
    component: CreatePassword,
  },

  {
    path: '/addresses',
    title: 'Addresses List',
    component: ListAddresses,
  },
  {
    path: '/addresses/crear',
    title: 'Create Address',
    component: CreateAddress,
  },
  {
    path: '/addresses/editar/:id',
    title: 'Update Address',
    component: UpdateAddress,
  },

  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  {
    path: '/digital-signature/:userId',
    title: 'Digital Signature',
    component: DigitalSignatureList,
  },
  {
    path: '/digital-signature/:userId/crear',
    title: 'Create Digital Signature',
    component: DigitalSignatureForm,
  },
  {
    path: '/digital-signature/:userId/editar/:id',
    title: 'Update Digital Signature',
    component: DigitalSignatureForm,
  },
  {
    path: '/security-questions',
    title: 'Security Questions List',
    component: SecurityQuestionList,
  },
  {
    path: '/security-questions/crear',
    title: 'Create Question',
    component: SecurityQuestionForm,
  },
  {
    path: '/security-questions/editar/:id',
    title: 'Update Question',
    component: SecurityQuestionForm,
  },
  {
    path: '/answers/:userId',
    title: 'User Answers',
    component: AnswerList,
  },
  {
    path: '/answers/:userId/crear',
    title: 'Create Answer',
    component: AnswerForm,
  },
  {
    path: '/answers/:userId/editar/:id',
    title: 'Update Answer',
    component: AnswerForm,
  },
  {
    path: '/device/:userId',
    title: 'Devices',
    component: DeviceList,
  },
  {
    path: '/device/:userId/crear',
    title: 'Create Device',
    component: DeviceForm,
  },
  {
    path: '/device/:userId/editar/:id',
    title: 'Update Device',
    component: DeviceForm,
  },
  {
    path: '/sessions',
    title: 'Sessions List',
    component: SessionList,
  },
  {
    path: '/sessions/:userId',
    title: 'User Sessions',
    component: SessionList,
  },
  {
    path: '/sessions/:userId/crear',
    title: 'Create Session',
    component: SessionForm,
  },
{
    path: '/recargas',
    title: 'Recargar Tarjeta',
    component: RecargaTarjeta,
},
{
    path: '/recargas/confirmacion',
    title: 'Confirmacion Recarga',
    component: ConfirmacionRecarga,
},
{
    path: '/horario',
    title: 'Horarios',
    component: Horarios,
},

];

export const transporteRoutes = [
  { 
    path: '/buses', 
    title: 'Buses List', 
    component: ListBuses 
  },
  { 
    path: '/buses/crear', 
    title: 'Create Bus', 
    component: CreateBus 
  },
  { 
    path: '/buses/editar/:id', 
    title: 'Update Bus', 
    component: UpdateBus 
  },
  { 
    path: '/paraderos', 
    title: 'Paraderos List', 
    component: ListParaderos 
  },
  { 
    path: '/paraderos/crear', 
    title: 'Create Paradero', 
    component: CreateParadero 
  },
  { 
    path: '/incidentes', 
    title: 'Detail Incidente', 
    component: ListIncidentes 
  },
  { 
    path: '/incidentes/bus/:busId', 
    title: 'Incidentes Bus', 
    component: ListIncidentes 
  },
  { 
    path: '/incidentes/crear/:busId', 
    title: 'Create Incidente', 
    component: CreateIncidente 
  },
  { 
    path: '/incidentes/:id', 
    title: 'Detail Incidente', 
    component: DetailIncidente 
  },
  { 
    path: '/turnos', 
    title: 'Turnos List', 
    component: ListTurnos 
  },
  { 
    path: '/turnos/crear', 
    title: 'Create Turno', 
    component: CreateTurno 
  },
  { 
    path: '/rutas', 
    title: 'Rutas List', 
    component: ListRutas 
  },
  { 
    path: '/rutas/crear', 
    title: 'Create Ruta', 
    component: CreateRuta 
  },
  { 
    path: '/rutas/:id', 
    title: 'Detail Ruta', 
    component: DetailRuta 
  },
];

const routes = [...generalRoutes, ...administrationRoutes, ...transporteRoutes];
export default routes;
