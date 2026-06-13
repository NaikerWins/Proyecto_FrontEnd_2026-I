import apiNest from "../interceptors/axiosNestInterceptor";

const API_URL = "/mensajes";

class MensajeService {
    async getMensajesRecibidos(userId: string) {
        try {
            const response = await apiNest.get(`${API_URL}/recibidos/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
            return [];
        }
    }

    async enviarMensajeDirecto(
        emisorId: string,
        emisorNombre: string,
        destinatarioId: string,
        destinatarioNombre: string,
        contenido: string,
    ) {
        try {
            const response = await apiNest.post(
                `${API_URL}/directo/${emisorId}`,
                { emisorNombre, destinatarioId, destinatarioNombre, contenido }
            );
            return response.data;
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            return null;
        }
    }

    async enviarMensajeGrupo(
        emisorId: string,
        emisorNombre: string,
        grupoId: number,
        contenido: string,
    ) {
        try {
            const response = await apiNest.post(
                `${API_URL}/grupo/${emisorId}`,
                { emisorNombre, grupoId, contenido }
            );
            return response.data;
        } catch (error) {
            console.error("Error al enviar mensaje a grupo:", error);
            return null;
        }
    }

    async enviarAlertaMasiva(
        emisorId: string,
        emisorNombre: string,
        contenido: string,
        alcance: string,
        esUrgente: boolean,
    ) {
        try {
            const response = await apiNest.post(
                `${API_URL}/alerta/${emisorId}`,
                { emisorNombre, contenido, alcance, esUrgente }
            );
            return response.data;
        } catch (error) {
            console.error("Error al enviar alerta:", error);
            return null;
        }
    }

    async marcarLeido(destinatarioId: number, userId: string) {
        try {
            await apiNest.patch(`${API_URL}/${destinatarioId}/leido/${userId}`);
        } catch (error) {
            console.error("Error al marcar leído:", error);
        }
    }
}

export const mensajeService = new MensajeService();