export interface NodoRuta {
    id?: number;
    orden: number;
    distanciaDesdeAnterior?: number;
    tiempoEstimado?: number;
    paradero?: {
        id: number;
        nombre: string;
        clasificacion: string;
    };
}

export interface NodoConParadero {
  orden: number;
  paradero: Paradero;
}

export interface Ruta {
    id?: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    tarifa: number;
    activa?: boolean;
    tiempo_estimado?: number;
    nodos?: NodoRuta[];
    paraderos?: NodoConParadero[];
}

export interface Paradero {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
}
  
