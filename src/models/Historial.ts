export interface HistorialViaje {
  boleto_id: number;
  estado: string;
  monto: number;
  fecha_abordaje: string;
  fecha_descenso: string;
  tiempo_total_minutos: number;
  bus_id: number;
  conductor_id: number;
  ruta: {
    id: number;
    nombre: string;
    paraderos_completos: {
      id: number;
      nombre: string;
      latitud: number;
      longitud: number;
    }[];
  };
  paradero_abordaje: { id: number; nombre: string };
  paradero_descenso: { id: number; nombre: string };
}