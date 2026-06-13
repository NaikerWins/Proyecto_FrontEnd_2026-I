export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: Date;
  tipo: 'bus-cercano' | 'alerta-clima' | 'general';
}