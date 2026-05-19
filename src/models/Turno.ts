export interface Turno {
    id?: number;
    fechaProgramada?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    observaciones?: string;
    conductor?: {
        id: number;
        licencia: string;
        persona: {
            nombre: string;
            apellido: string;
        };
    };
    bus?: {
        id: number;
        placa: string;
        modelo: string;
    };
}