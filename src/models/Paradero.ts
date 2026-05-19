export interface Paradero {
    id?: number;
    nombre: string;
    codigo?: string;
    latitud: number;
    longitud: number;
    clasificacion: string;
    activo?: boolean;
}

export interface ParaderoCercano {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
  distancia_metros: number;
  rutas: { id: number; nombre: string }[];
}