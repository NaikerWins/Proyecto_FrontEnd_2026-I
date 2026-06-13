export interface Mensaje {
    id?: number;
    emisorId: string;
    emisorNombre: string;
    contenido: string;
    tipo: 'directo' | 'grupo' | 'masivo';
    esUrgente?: boolean;
    fechaEnvio?: string;
    leido?: boolean;
    grupoNombre?: string;
    grupoId?: number;
    destinatarioId?: number;
}