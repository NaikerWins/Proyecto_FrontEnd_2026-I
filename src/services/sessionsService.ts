import api from "../interceptors/axiosInterceptor";
import { Session } from "../models/Sessions";

const BASE_URL = '/sessions';

export const SessionService = {
  getAll: (): Promise<{ data: Session[] }> =>
    api.get(BASE_URL),

  getById: (id: string): Promise<{ data: Session }> =>
    api.get(`${BASE_URL}/${id}`),

  getByUserId: (userId: string): Promise<{ data: Session[] }> =>
    api.get(`${BASE_URL}/user/${userId}`),

  create: (userId: string | number, data: Partial<Session>) =>
    api.post(`${BASE_URL}/user/${userId}`, data),

  update: (id: string, data: Partial<Session>): Promise<{ data: Session }> =>
    api.put(`${BASE_URL}/${id}`, data),

  remove: (id: string): Promise<void> =>
    api.delete(`${BASE_URL}/${id}`)
};