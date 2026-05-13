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

export interface Ruta {
    id?: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    tarifa: number;
    activa?: boolean;
    nodos?: NodoRuta[];
}