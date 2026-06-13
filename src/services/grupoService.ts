import apiNest from '../interceptors/axiosNest';
import { Grupo, MiembroGrupo } from '../models/Grupo';

const API_URL = "/grupos";

class GrupoService {
    async getGruposPublicos() {
        try {
            const response = await apiNest.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener grupos:", error);
        }
    }

    async getPublicos(): Promise<Grupo[]> {
        try {
            const res = await apiNest.get<Grupo[]>(`${API_URL}?tipo=PUBLIC`);
            return res.data.map((g) => ({
                ...g,
                memberCount: g.miembros?.length ?? 0,
            }));
        } catch {
            return [];
        }
    }

    async getGruposByUsuario(userId: string) {
        try {
            const response = await apiNest.get(`${API_URL}/usuario/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener grupos del usuario:", error);
        }
    }

    async getMisGrupos(): Promise<Grupo[]> {
        try {
            const res = await apiNest.get<Grupo[]>(`${API_URL}/mine`);
            return res.data.map((g) => ({
                ...g,
                memberCount: g.miembros?.length ?? 0,
            }));
        } catch {
            return [];
        }
    }

    async getMiembros(grupoId: number): Promise<MiembroGrupo[]> {
        try {
            const res = await apiNest.get<MiembroGrupo[]>(`${API_URL}/${grupoId}/members`);
            return res.data;
        } catch {
            return [];
        }
    }

    async unirse(grupoId: number): Promise<MiembroGrupo | null> {
        try {
            const res = await apiNest.post<MiembroGrupo>(`${API_URL}/${grupoId}/join`);
            return res.data;
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al unirse al grupo');
        }
    }

    async salir(grupoId: number): Promise<void> {
        try {
            await apiNest.delete(`${API_URL}/${grupoId}/leave`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al salir del grupo');
        }
    }

    async promover(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.post(`${API_URL}/${grupoId}/members/${usuarioId}/promote`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al promover miembro');
        }
    }

    async remover(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.delete(`${API_URL}/${grupoId}/members/${usuarioId}`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al remover miembro');
        }
    }

    async bloquear(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.post(`${API_URL}/${grupoId}/members/${usuarioId}/block`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al bloquear miembro');
        }
    }
}

export const grupoService = new GrupoService();