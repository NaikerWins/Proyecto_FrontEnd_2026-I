import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DeviceService } from '../../services/deviceService';
import { Device } from '../../models/Device';
import { Button, Form } from 'react-bootstrap';

const DeviceForm: React.FC = () => {
  const { userId, id } = useParams<{ userId: string; id?: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device>({
    name: '',
    ip: '',
    operating_system: '',
  });

  useEffect(() => {
    if (id) loadDevice();
  }, [id]);

  const loadDevice = async () => {
    const data = await DeviceService.getById(Number(id));
    setDevice(data);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type, value } = e.target;
    const newValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setDevice((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) await DeviceService.update(Number(id), device);
      else if (userId) await DeviceService.create(Number(userId), device);

      navigate(`/device/${userId}`);
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{id ? 'Editar Dispositivo' : 'Registrar Nuevo Dispositivo'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Dispositivo</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={device.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección IP</Form.Label>
          <Form.Control
            type="text"
            name="ip"
            value={device.ip}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sistema Operativo</Form.Label>
          <Form.Control
            type="text"
            name="operating_system"
            value={device.operating_system}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit">
          {id ? 'Actualizar' : 'Guardar'}
        </Button>

        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate(`/device/${userId}`)}
        >
          Cancelar
        </Button>
      </Form>
    </div>
  );
};

export default DeviceForm;
