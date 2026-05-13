export interface Paradero {
    id?: number;
    nombre: string;
    codigo?: string;
    latitud: number;
    longitud: number;
    clasificacion: string;
    activo?: boolean;
}