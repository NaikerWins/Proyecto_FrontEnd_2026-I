export interface Bus {
    id?: number;
    placa?: string;
    modelo?: string;
    anio?: number;
    capacidadSentados?: number;
    capacidadParados?: number;
    estado?: string;
    fotoBus?: string;
    codigoQR?: string;
    empresa?: {
        id: number;
        nombre: string;
        nit: string;
    };
    gps?: {
        id: number;
        latitud: number;
        longitud: number;
        activo: boolean;
    };
}