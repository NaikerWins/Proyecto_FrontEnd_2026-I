export interface Programacion {
    id?: number;
    salida?: string;
    tolerancia?: number;
    estado?: string;
    recurrencia?: string;
    ruta?: { id: number; name: string };
    bus?: { id: number; placa: string; modelo: string };
}