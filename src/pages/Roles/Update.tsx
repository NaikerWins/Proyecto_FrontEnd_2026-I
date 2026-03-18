import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField }  from "../../components/Generics/MUI/GenericForm";
import { Role } from "../../models/Role";
import { roleService } from "../../services/roleService";
import Swal from "sweetalert2";

const UpdateRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRole(id);
    }
  }, [id]);

  const fetchRole = async (roleId: string) => {
    try {
      const roleData = await roleService.getRoleById(roleId);
      if (roleData) {
        setRole(roleData);
      } else {
        Swal.fire({
          title: "Error",
          text: "Rol no encontrado",
          icon: "error",
        });
        navigate("/roles");
      }
    } catch (error) {
      console.error("Error al cargar rol:", error);
      Swal.fire({
        title: "Error",
        text: "Error al cargar el rol",
        icon: "error",
      });
      navigate("/roles");
    } finally {
      setLoading(false);
    }
  };

  const roleFields: FormField[] = [
    { name: "name", label: "Nombre del Rol", type: "text", required: true },
    { name: "description", label: "Descripción", type: "text", multiline: true, rows: 3 },
    { name: "isActive", label: "Activo", type: "boolean" },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      if (role?.id) {
        const updatedRole = await roleService.updateRole(role.id, values);
        if (updatedRole) {
          Swal.fire({
            title: "Éxito",
            text: "Rol actualizado correctamente",
            icon: "success",
            timer: 3000
          });
          navigate("/roles");
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al actualizar el rol",
            icon: "error",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al actualizar el rol",
        icon: "error",
      });
    }
  };

  const handleCancel = () => {
    navigate("/roles");
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (!role) {
    return <Typography>Rol no encontrado</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Actualizar Rol
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <GenericForm
          title="Información del Rol"
          fields={roleFields}
          initialValues={role}
          onSubmit={handleSubmit}
          submitLabel="Actualizar Rol"
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
};

export default UpdateRole;