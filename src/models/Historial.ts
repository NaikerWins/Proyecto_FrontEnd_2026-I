export interface ParaderoInfo {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
}

export interface HistorialViaje {
  boleto_id: number;
  estado: string;
  monto: number;
  fecha_abordaje: string;
  fecha_descenso: string;
  tiempo_total_minutos: number;
  bus_placa?: string;
  conductor_nombre?: string;
  ruta: {
    id: number;
    nombre: string;
    paraderos_completos: ParaderoInfo[];
  };
  paradero_abordaje: ParaderoInfo;
  paradero_descenso: ParaderoInfo | null;
}