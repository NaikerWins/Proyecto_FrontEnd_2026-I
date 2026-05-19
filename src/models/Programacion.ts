export interface Programacion {
    id?: number;
    salida?: string;
    tolerancia?: number;
    estado?: string;
    recurrencia?: string;
    ruta?: { id: number; name: string };
    bus?: { id: number; placa: string; modelo: string };

    bus_id: number;
    conductor_id: number;
    capacidad_maxima: number;
    ruta_id: number;
    ocupacion_actual?: number;
}