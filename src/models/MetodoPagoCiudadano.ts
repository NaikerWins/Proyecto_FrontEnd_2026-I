import { MetodoPago } from "./MetodoPago";

export interface MetodoPagoCiudadano {
  id?: number;
  id_ciudadano?: string;
  saldo?: number;
  monto?: number;
  cargo?: number;
  metodopago?: MetodoPago;
}