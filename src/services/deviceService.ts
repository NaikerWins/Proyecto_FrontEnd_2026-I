import api from "../interceptors/axiosInterceptor";

export const DeviceService = {
  getByUserId: async (userId: number) => {
    const res = await api.get(`/devices/user/${userId}`);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/devices/${id}`);
    return res.data;
  },
  create: async (userId: number, deviceData: any) => {
    const res = await api.post(`/devices/user/${userId}`, deviceData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
  update: async (id: number, deviceData: any) => {
    const res = await api.put(`/devices/${id}`, deviceData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/devices/${id}`);
    return res.status === 200;
  },
};
