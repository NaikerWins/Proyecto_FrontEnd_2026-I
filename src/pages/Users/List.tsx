import React, { useEffect, useState } from 'react';
import GenericTable from '../../components/Generics/GenericList';
import { User } from '../../models/User';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Button, Form, InputGroup } from 'react-bootstrap';

const ListUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filtra localmente por name o email
  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleAction = async (action: string, item: User) => {
    if (action === 'edit') {
      navigate(`/users/editar/${item.id}`);
    } else if (action === 'delete') {
      Swal.fire({
        title: 'Eliminación',
        text: '¿Está seguro de querer eliminar el registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await userService.deleteUser(item.id!);
          if (success) {
            Swal.fire({
              title: 'Eliminado',
              text: 'El registro se ha eliminado correctamente',
              icon: 'success',
            });
            fetchData();
          }
        }
      });
    } else if (action === 'signature') {
      navigate(`/digital-signature/${item.id}`);
    } else if (action === 'answers') {
      navigate(`/answers/${item.id}`);
    } else if (action === 'devices') {
      navigate(`/device/${item.id}`);
    } else if (action === 'profile') {
      navigate(`/profiles/list`);
    } else if (action === 'address') {
      navigate(`/addresses`);
    } else if (action === 'passwords') {
      navigate(`/passwords/${item.id}`);
    } else if (action === 'sessions') {
      navigate(`/sessions/${item.id}`);
    }
  };

  return (
    <div className="container mt-4">
      {/* Título y botones */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Usuarios</h2>
        <div className="d-flex gap-2">
          <Button
            variant="secondary"
            className="text-white fw-semibold"
            onClick={() => navigate('/security-questions')}
          >
            Preguntas de Seguridad
          </Button>
          <Button
            variant="success"
            className="text-white fw-semibold"
            onClick={() => navigate('/users/crear')}
          >
            Crear Usuario
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
        <InputGroup.Text>🔍</InputGroup.Text>
        <Form.Control
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch('')}>
            ✕
          </Button>
        )}
      </InputGroup>

      {/* Tabla genérica */}
      <GenericTable
        data={filteredUsers}  
        columns={['id', 'name', 'email']}
        actions={[
          { name: 'edit', label: 'Editar', color: 'info' },
          { name: 'delete', label: 'Eliminar', color: 'error' },
          { name: 'signature', label: 'Firma', color: 'secondary' },
          { name: 'answers', label: 'Respuestas', color: 'success' },
          { name: 'devices', label: 'Dispositivos', color: 'info' },
          { name: 'profile', label: 'Perfil', color: 'error' },
          { name: 'address', label: 'Direccion', color: 'secondary' },
          { name: 'passwords', label: 'Contraseñas', color: 'success' },
          { name: 'sessions', label: 'Sesiones', color: 'info' },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListUsers;