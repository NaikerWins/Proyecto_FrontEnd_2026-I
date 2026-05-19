export interface Persona {
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

export interface Conductor {
  id?: number;
  licencia?: string;
  persona?: Persona;
}