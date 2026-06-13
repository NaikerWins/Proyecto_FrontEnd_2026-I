import api from "../interceptors/axiosInterceptor"; // apunta a Spring Boot (8081)

export interface PersonaBasica {
    id: string;
    name: string;
    email: string;
}

class PersonaService {
    async buscarPersonas(query: string): Promise<PersonaBasica[]> {
        try {
            const response = await api.get<PersonaBasica[]>(`/users/buscar`, {
                params: { q: query },
            });
            return response.data;
        } catch (error) {
            console.error("Error al buscar personas:", error);
            return [];
        }
    }
}

export const personaService = new PersonaService();