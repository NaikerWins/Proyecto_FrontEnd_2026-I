import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DeviceService } from "../../services/deviceService";
import { Device } from "../../models/Device";
import GenericTable from "../../components/Generics/GenericList";
import { Button, Spinner } from "react-bootstrap";
import api from "../../interceptors/axiosInterceptor"; // 👈 lo usamos para llamar /users/:id

const DeviceList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Desconocido");

  const fetchUserName = async (id: number) => {
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data && res.data.name) {
        setUserName(res.data.name);
      } else {
        setUserName(`Usuario #${id}`);
      }
    } catch (error: any) {
      // Si el endpoint no existe o falla, no rompe nada
      console.warn("No se pudo obtener el nombre del usuario:", error.message);
      setUserName(`Usuario #${id}`);
    }
  };

  const fetchData = async () => {
    try {
      if (userId) {
        const id = Number(userId);
        const data = await DeviceService.getByUserId(id);
        setDevices(data);
        await fetchUserName(id); // 👈 intentar obtener el nombre del usuario
      }
    } catch (error) {
      console.error("Error al obtener dispositivos o usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAction = async (name: string, item: Record<string, any>) => {
    const device = item as Device;

    if (name === "edit") navigate(`/device/${userId}/editar/${device.id}`);

    if (name === "delete") {
      if (!device.id) return;
      const confirmed = confirm("¿Seguro que deseas eliminar este dispositivo?");
      if (confirmed) {
        await DeviceService.delete(device.id);
        fetchData();
      }
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="success"
          className="text-white fw-semibold"
          onClick={() => navigate(`/device/${userId}/crear`)}
        >
          Añadir Dispositivo
        </Button>
      </div>

      <GenericTable
        data={devices}
        columns={["id", "name", "ip", "operating_system"]}
        actions={[
          { name: "edit", label: "Editar", color: "primary" },
          { name: "delete", label: "Eliminar", color: "primary" },
        ]}
        onAction={handleAction}
        title={`Lista de Dispositivos de ${userName}`}
      />
    </div>
  );
};

export default DeviceList;
