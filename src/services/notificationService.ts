import { Notificacion } from '../models/Notificacion';

const NOTIFICACIONES_KEY = 'notificaciones';
const NOTIFICACIONES_EVENT = 'notificaciones-cambiadas';

export const getNotificaciones = (): Notificacion[] => {
  const data = localStorage.getItem(NOTIFICACIONES_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarNotificaciones = (notificaciones: Notificacion[]) => {
  localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(notificaciones));
  window.dispatchEvent(new CustomEvent(NOTIFICACIONES_EVENT));
};

export const agregarNotificacion = (notificacion: Omit<Notificacion, 'id' | 'fecha'>) => {
  const notificaciones = getNotificaciones();
  const nueva: Notificacion = {
    ...notificacion,
    id: Date.now().toString(),
    fecha: new Date(),
  };
  notificaciones.unshift(nueva);
  if (notificaciones.length > 50) {
    notificaciones.pop();
  }
  guardarNotificaciones(notificaciones);
};

export const onNotificacionesCambiadas = (callback: () => void) => {
  window.addEventListener(NOTIFICACIONES_EVENT, callback);
  return () => window.removeEventListener(NOTIFICACIONES_EVENT, callback);
};