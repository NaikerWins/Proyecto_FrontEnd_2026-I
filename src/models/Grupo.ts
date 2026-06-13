export interface Grupo {
    id: number;
    nombre: string;
    descripcion?: string;
    tipo: 'PUBLIC' | 'PRIVATE';
    creadoPor?: string;
    creadoEn?: string;
    miembros?: MiembroGrupo[];
    memberCount?: number;
}

export interface MiembroGrupo {
    id: number;
    usuarioId: string;
    rol: 'ADMIN' | 'MEMBER';
    unidoEn: string;
    bloqueadoEn?: string | null;
    nombre?: string;
    apellido?: string;
    email?: string;
}