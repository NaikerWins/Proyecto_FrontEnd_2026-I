import apiNest from "../interceptors/axiosNest";
import { Pqrs } from "../models/Pqrs";

const BASE = "/pqrs";

class PqrsService {
    async create(data: Omit<Pqrs, "id" | "radicado" | "estado" | "creadoEn" | "fechaLimite">): Promise<Pqrs> {
        const res = await apiNest.post<Pqrs>(BASE, data);
        return res.data;
    }

    async createConRadicado(data: Omit<Pqrs, "id" | "estado" | "creadoEn" | "fechaLimite">): Promise<Pqrs> {
        const res = await apiNest.post<Pqrs>(`${BASE}/con-radicado`, data);
        return res.data;
    }

    async findByRadicado(radicado: string): Promise<Pqrs | null> {
        try {
            const res = await apiNest.get<Pqrs>(`${BASE}/${radicado}`);
            return res.data;
        } catch {
            return null;
        }
    }
}

export const pqrsService = new PqrsService();