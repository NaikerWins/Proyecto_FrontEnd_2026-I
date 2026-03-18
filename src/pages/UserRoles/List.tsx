import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { userRoleService } from "../../services/userRoleService";
import { userService } from "../../services/userService";
import { UserRole } from "../../models/UserRole";
import Swal from "sweetalert2";

interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

const UserRolesList: React.FC = () => {
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

  useEffect(() => {
    fetchAllUsersWithRoles();
  }, []);

  const fetchAllUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      const users = await userService.getUsers();
      const usersWithRolesData: UserWithRoles[] = [];
      
      for (const user of users) {
        try {
          const userRoles = await userRoleService.getUserRolesWithDetails(user.id);
          
          usersWithRolesData.push({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: userRoles
          });
        } catch (error) {
          console.error(`Error cargando roles para usuario ${user.id}:`, error);
          usersWithRolesData.push({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: []
          });
        }
      }
      
      setUsersWithRoles(usersWithRolesData);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      showSnackbar("Error al cargar la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "El usuario perderá este rol",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const success = await userRoleService.removeRoleFromUser(userId, roleId);
          if (success) {
            showSnackbar("Rol removido correctamente", "success");
            fetchAllUsersWithRoles();
          } else {
            showSnackbar("Error al remover el rol", "error");
          }
        } catch (error) {
          console.error("Error removiendo rol:", error);
          showSnackbar("Error al remover el rol", "error");
        }
      }
    });
  };

  const getRoleName = (userRole: UserRole) => {

    if (userRole.role && userRole.role.name) {
      return userRole.role.name;
    }
    
    return `Rol ${userRole.roleId}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando lista de usuarios...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lista de Usuarios y Roles
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Total de usuarios: {usersWithRoles.length}
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles Asignados</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersWithRoles.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="subtitle2">{user.name}</Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {user.roles.map((userRole, index) => (
                        <Chip 
                          key={index}
                          // USAR LA FUNCIÓN CORREGIDA
                          label={getRoleName(userRole)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Sin roles asignados
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {user.roles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {user.roles.map((userRole, index) => (
                        <Typography key={index} variant="caption" display="block">
                          Desde: {formatDate(userRole.startAt)}
                          {userRole.endAt && ` • Hasta: ${formatDate(userRole.endAt)}`}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {user.roles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {user.roles.map((userRole, index) => (
                        <Button
                          key={index}
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRole(user.id, userRole.roleId)}
                        >
                          {/* USAR LA FUNCIÓN CORREGIDA */}
                          Quitar {getRoleName(userRole)}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Sin acciones
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default UserRolesList;