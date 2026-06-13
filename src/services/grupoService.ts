import apiNest from '../interceptors/axiosNest';
import { Grupo, MiembroGrupo } from '../models/Grupo';

const BASE = '/grupos';

class GrupoService {

    async getPublicos(): Promise<Grupo[]> {
        try {
            const res = await apiNest.get<Grupo[]>(`${BASE}?tipo=PUBLIC`);
            return res.data.map((g) => ({
                ...g,
                memberCount: g.miembros?.length ?? 0,
            }));
        } catch {
            return [];
        }
    }

    async getMisGrupos(): Promise<Grupo[]> {
        try {
            const res = await apiNest.get<Grupo[]>(`${BASE}/mine`);
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
            const res = await apiNest.get<MiembroGrupo[]>(`${BASE}/${grupoId}/members`);
            return res.data;
        } catch {
            return [];
        }
    }

    async unirse(grupoId: number): Promise<MiembroGrupo | null> {
        try {
            const res = await apiNest.post<MiembroGrupo>(`${BASE}/${grupoId}/join`);
            return res.data;
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al unirse al grupo');
        }
    }

    async salir(grupoId: number): Promise<void> {
        try {
            await apiNest.delete(`${BASE}/${grupoId}/leave`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al salir del grupo');
        }
    }

    async promover(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.post(`${BASE}/${grupoId}/members/${usuarioId}/promote`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al promover miembro');
        }
    }

    async remover(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.delete(`${BASE}/${grupoId}/members/${usuarioId}`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al remover miembro');
        }
    }

    async bloquear(grupoId: number, usuarioId: string): Promise<void> {
        try {
            await apiNest.post(`${BASE}/${grupoId}/members/${usuarioId}/block`);
        } catch (err: any) {
            throw new Error(err?.response?.data?.message ?? 'Error al bloquear miembro');
        }
    }
}

export const grupoService = new GrupoService();