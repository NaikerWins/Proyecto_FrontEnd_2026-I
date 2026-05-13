export interface IngresoMetodo {
    tipo: string;
    mes: number;
    anio: number;
    total: number;
}

export interface DistribucionEtaria {
    rangos: Record<string, number>;
    porcentajes: Record<string, string>;
    total: number;
}