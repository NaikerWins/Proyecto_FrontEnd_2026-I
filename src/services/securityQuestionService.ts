import api from "../interceptors/axiosInterceptor";
import { SecurityQuestion } from "../models/SecurityQuestion";

export const securityQuestionService = {
  async getAll(): Promise<SecurityQuestion[]> {
    const response = await api.get("/security-questions");
    return response.data;
  },

  async getById(id: number): Promise<SecurityQuestion> {
    const response = await api.get(`/security-questions/${id}`);
    return response.data;
  },

  async create(data: SecurityQuestion): Promise<SecurityQuestion> {
    const response = await api.post("/security-questions", data);
    return response.data;
  },

  async update(id: number, data: SecurityQuestion): Promise<SecurityQuestion> {
    const response = await api.put(`/security-questions/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/security-questions/${id}`);
  },
};
