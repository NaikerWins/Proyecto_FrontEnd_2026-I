/** Mensaje al redirigir a login por sesión inválida o expirada (401, sin token, etc.). */
export const SESSION_INVALID_MESSAGE = 'Sesión expirada o inválida';

/** sessionStorage: redirect full-page (p. ej. axios) no puede pasar `state` de React Router. */
export const SESSION_INVALID_STORAGE_KEY = 'fbc.auth.sessionInvalidMessage';

/** Respuesta HTTP 403 por falta de permisos (interceptor / API). */
export const ACCESS_DENIED_MESSAGE = 'Acceso denegado';

/** Pantalla completa cuando no hay permiso (rutas admin en el front o 403 del backend). */
export const FORBIDDEN_PAGE_TITLE = 'Error 403. Acceso denegado';

export const ACCESS_DENIED_STORAGE_KEY = 'fbc.auth.accessDeniedMessage';
