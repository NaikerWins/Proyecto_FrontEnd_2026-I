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

const coreRoutes = [
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
    path: '/RolePermission/list',
  title: 'list RolePermission',
  component: RolePermissionPage,
  },
  {
    path: '/profiles/list',
    title: 'list Profile',
    component: ListProfile,
  },
  {
    path: '/permission/list',
  title: 'LIST permission',
  component: ListPermissions,
  },
  {
    path: '/auth/complete-profile',
    title: 'Complete Profile',
    component: CompleteProfile,
  },
  {
    path: '/roles',
    title: 'Roles List',
    component: ListRoles,
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
    path: '/roles/crear',
    title: 'Create Role',
    component: CreateRole,
  },
  {
    path: '/roles/editar/:id',
    title: 'Update Role',
    component: UpdateRole,
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


];

const routes = [...coreRoutes];
export default routes;
