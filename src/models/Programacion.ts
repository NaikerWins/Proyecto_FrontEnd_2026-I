export interface Programacion {

    id?: number;

    salida?: string;

    tolerancia?: number;

    estado?: string;

    recurrencia?: string;

    conductor_id?: number;

    capacidad_maxima?: number;

    ocupacion_actual?: number;

    ruta?: {
        id: number;
        nombre?: string;
    };

    bus?: {
        id: number;
        placa?: string;
        modelo?: string;
    };

}