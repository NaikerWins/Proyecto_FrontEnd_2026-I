export interface ParaderoCercano {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
  distancia_metros: number;
  rutas: { id: number; nombre: string }[];
}