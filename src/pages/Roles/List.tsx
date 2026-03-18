import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Role } from "../../models/Role";
import { roleService } from "../../services/roleService";
import Swal from "sweetalert2";

const ListRoles: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      showSnackbar("Error al cargar roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAction = async (action: string, item: Record<string, any>) => {
    // Convertir el item a Role
    const role = item as Role;
    
    if (action === "edit") {
      navigate(`/roles/editar/${role.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed && role.id) {
          const success = await roleService.deleteRole(role.id);
          if (success) {
            showSnackbar("Rol eliminado correctamente", "success");
            fetchRoles();
          } else {
            showSnackbar("Error al eliminar el rol", "error");
          }
        }
      });
    } else if (action === "permissions") {
      navigate(`/permission/list`);
    }
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/roles/crear")}
        >
          Nuevo Rol
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/user-roles/1/asignar")}
        >
          ASIGNAR ROL A USUARIO
        </Button>
      </Box>

      <GenericTable
      data={roles}
      columns={["id", "name", "description", "created_at"]} // ← Usar nombres reales
      actions={[
        { name: "edit", label: "Editar", color: "primary" },
        { name: "delete", label: "Eliminar", color: "error" },
        { name: "permissions", label: "Permisos", color: "success" },
      ]}
      onAction={handleAction}
      title="Lista de Roles"
    />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListRoles;