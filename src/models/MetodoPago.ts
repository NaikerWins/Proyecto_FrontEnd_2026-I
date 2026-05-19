export interface MetodoPago {
  id: number;
  tipo: string;
  saldoInicial: number;
}

export interface MetodoPagoCiudadano {
  id: number;
  id_ciudadano: string;
  saldo: number;
  monto?: number;
  cargo?: number;
  metodopago?: MetodoPago;
}