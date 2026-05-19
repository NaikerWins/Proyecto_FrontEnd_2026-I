export interface Conductor {
    id?: number;
    licencia: string;
    persona: {
        id?: number;
        nombre: string;
        apellido: string;
        email: string;
        telefono?: string;
    };
}