export interface AbordajeRequest {
  ciudadano_id: string;
  programacion_id: number;
  metodo_pago_id: number;
  paradero_abordaje_id: number;
}

export interface DescensoRequest {
  boleto_id: number;
  paradero_descenso_id: number;
}

export interface AbordajeResponse {
  message: string;
  boleto_id: number;
  monto_cobrado: number;
  saldo_restante?: number;
  ocupacion_actual: number;
  capacidad_maxima: number;
}

export interface DescensoResponse {
  message: string;
  boleto_id: number;
  hora_descenso: string;
  paradero_descenso: string;
}