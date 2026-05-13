export interface Foto {
    id?: number;
    url: string;
}

export interface Comentario {
    id?: number;
    contenido: string;
    autor: string;
    fecha?: string;
}

export interface Incidente {
    id?: number;
    tipo: string;
    gravedad: string;
    estado?: string;
    descripcion: string;
    notificadoSupervisor?: boolean;
    fecha?: string;
    bus?: {
        id: number;
        placa: string;
    };
    conductor?: {
        id: number;
        licencia: string;
        persona: {
            nombre: string;
            apellido: string;
        };
    };
    turno?: {
        id: number;
    };
    fotos?: Foto[];
    comentarios?: Comentario[];
}

export interface EstadisticasIncidente {
    total: number;
    porTipo: Record<string, number>;
    tasaResolucion: string;
}