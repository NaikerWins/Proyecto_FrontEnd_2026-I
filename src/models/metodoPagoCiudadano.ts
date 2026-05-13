export interface Mpc {
    id?: number;
    id_ciudadano?: string;
    saldo?: number;
    monto?: number;
    cargo?: number;
    metodopago?: { id: number; tipo: string };
}