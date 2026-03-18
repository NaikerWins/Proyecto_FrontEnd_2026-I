import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { userRoleService } from "../../services/userRoleService";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { UserRole } from "../../models/UserRole";
import Swal from "sweetalert2";

const AssignRole: React.FC = () => {
  const [userId, setUserId] = useState<string | "">("");
  const [roleId, setRoleId] = useState<string | "">("");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserRoles(userId);
    } else {
      setUserRoles([]);
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };


    const loadUserRoles = async (userId: string) => {
    try {

        const roles = await userRoleService.getUserRolesWithDetails(userId);
        console.log("📊 UserRoles con detalles:", roles);
        setUserRoles(roles);
    } catch (error) {
        console.error("Error loading user roles:", error);
        setError("Error al cargar los roles del usuario");
    }
    };

  const handleAssignRole = async () => {
    if (!userId || !roleId) {
      setError("Por favor selecciona un usuario y un rol");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("Enviando datos:", {
        userId: userId,
        roleId: roleId
      });

      const userRole = await userRoleService.assignRoleToUser(userId, roleId);

      if (userRole) {
        setSuccess(`Rol asignado correctamente al usuario`);
        Swal.fire({
          title: "Éxito",
          text: "Rol asignado correctamente",
          icon: "success",
          timer: 3000,
        });
        
        await loadUserRoles(userId);
        setRoleId("");
      } else {
        setError("Error al asignar el rol");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al asignar el rol";
      setError(errorMessage);
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleIdToRemove: string) => {
    if (!userId) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el rol del usuario",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const success = await userRoleService.removeRoleFromUser(userId, roleIdToRemove);
        if (success) {
          Swal.fire({
            title: "Eliminado",
            text: "Rol eliminado correctamente",
            icon: "success",
            timer: 3000,
          });
          await loadUserRoles(userId);
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al eliminar el rol",
            icon: "error",
          });
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error",
          text: error.message || "Error al eliminar el rol",
          icon: "error",
        });
      }
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.email})` : `Usuario ${userId}`;
  };

  const getRoleNameFromUserRole = (userRole: UserRole) => {
    if (userRole.role && userRole.role.name) {
      return userRole.role.name;
    }

    const role = roles.find(r => r.id === userRole.roleId);
    return role ? role.name : `Rol ${userRole.roleId}`;
  };

  const getAvailableRoles = () => {
    if (!userId) return roles;
    
    const currentRoleIds = userRoles.map(ur => ur.roleId);
    return roles.filter(role => role.id && !currentRoleIds.includes(role.id));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Asignar Roles a Usuarios
      </Typography>

      <Grid container spacing={3}>
        {/* Formulario de asignación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Asignar Nuevo Rol
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={userId}
                label="Usuario"
                onChange={(e) => setUserId(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Seleccionar usuario</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={roleId}
                label="Rol"
                onChange={(e) => {
                  console.log("Rol seleccionado:", e.target.value);
                  setRoleId(e.target.value as string);
                }}
                disabled={!userId}
              >
                <MenuItem value="">
                  <em>Seleccionar rol</em>
                </MenuItem>
                {getAvailableRoles().map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignRole}
              disabled={loading || !userId || !roleId}
              fullWidth
            >
              {loading ? "Asignando..." : "Asignar Rol"}
            </Button>
          </Paper>
        </Grid>

        {/* Roles actuales del usuario */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Roles Actuales del Usuario
            </Typography>

            {!userId ? (
              <Alert severity="info">
                Selecciona un usuario para ver sus roles
              </Alert>
            ) : userRoles.length === 0 ? (
              <Alert severity="warning">
                Este usuario no tiene roles asignados
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {userRoles.map((userRole) => (
                  <Card key={userRole.id} variant="outlined">
                    <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          {/* USAR LA FUNCIÓN CORREGIDA */}
                          <Typography variant="subtitle1">
                            {getRoleNameFromUserRole(userRole)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Desde: {formatDate(userRole.startAt)}
                            {userRole.endAt && ` • Hasta: ${formatDate(userRole.endAt)}`}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRole(userRole.roleId)}
                        >
                          Quitar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssignRole;