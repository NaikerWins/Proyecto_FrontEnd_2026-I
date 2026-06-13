import api from "../interceptors/busesInterceptor";

const API_URL = "/reportes";

class ReporteService {

    async getIngresosPorMetodo(meses: number): Promise<any[]> {
    try {
        const response = await api.get(`${API_URL}/ingresos/${meses}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener ingresos:", error);
        return [];
    }}

    async exportarIngresos(meses: number): Promise<any[]> {
    try {
        const response = await api.get(`${API_URL}/exportar/${meses}`);
        return response.data;
    } catch (error) {
        console.error("Error al exportar ingresos:", error);
        return [];
    }}

    async getDistribucionEtaria(fechaInicio?: string, fechaFin?: string): Promise<any> {
        try {
            const params = fechaInicio && fechaFin ? { fechaInicio, fechaFin } : {};
            const response = await api.get(`${API_URL}/distribucionporcentual`, { params });
            return response.data;
        } catch (error) {
            console.error("Error al obtener distribución de edades:", error);
            return null;
        }
    }

    async getTendenciaIncidentes(meses: number): Promise<any[]> {
    try {
        const response = await api.get(`${API_URL}/incidentes/${meses}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener tendencia incidentes:', error);
        return [];
    }
}

    async getRutas(): Promise<any[]> {
        try {

            const response = await api.get('/rutas');

            return response.data;

        } catch (error) {

            console.error('Error al obtener rutas:', error);

            return [];
        }
    }

    async getEmpresas(): Promise<any[]> {
    try {

        const response = await api.get('/empresas');

        return response.data;

    } catch (error) {

        console.error(
            'Error al obtener empresas:',
            error
        );

        return [];
    }
}


}

export const reporteService = new ReporteService();


