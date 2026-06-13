export interface GrupoPersona {
    id?: number;
    userId: string;
    nombre: string;
    rol: string;
    bloqueado: boolean;
    fechaUnion?: string;
}

export interface Grupo {
    id?: number;
    nombre: string;
    descripcion?: string;
    imagen?: string;
    tipo: string;
    adminId: string;
    adminNombre: string;
    activo?: boolean;
    fechaCreacion?: string;
    miembros?: GrupoPersona[];
}