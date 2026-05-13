export interface Paradero {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
}

export interface NodoConParadero {
  orden: number;
  paradero: Paradero;
}

export interface Ruta {
  id: number;
  nombre: string;
  descripcion?: string;
  tarifa: number;
  tiempo_estimado?: number;
  paraderos?: NodoConParadero[];
}