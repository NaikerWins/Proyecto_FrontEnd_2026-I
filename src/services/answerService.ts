import api from "../interceptors/axiosInterceptor";
import { Answer } from "../models/Answer";

export const answerService = {
  async getByUserId(userId: number): Promise<Answer[]> {
    const response = await api.get(`/answers/user/${userId}`);
    return response.data;
  },

  async create(userId: number, questionId: number, content: string): Promise<Answer> {
    const response = await api.post(
      `/answers/user/${userId}/question/${questionId}`,
      { content }
    );
    return response.data;
  },

  async update(id: number, content: string): Promise<Answer> {
    const response = await api.put(`/answers/${id}`, { content });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/answers/${id}`);
  },
};
