import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Password } from "../../models/Password";
import { passwordService } from "../../services/passwordService";

const UserPasswordsList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });
  const [validUserId, setValidUserId] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (!isNaN(parsedUserId)) {
        setValidUserId(parsedUserId);
        fetchPasswords(parsedUserId);
      } else {
        console.error("❌ userId inválido:", userId);
        showSnackbar("ID de usuario inválido", "error");
        setLoading(false);
      }
    }
  }, [userId]);


  const fetchPasswords = async (userId: number) => {
    try {
      setLoading(true);
      const passwordsData = await passwordService.getUserPasswords(userId);
      setPasswords(passwordsData);
    } catch (error: any) {
      console.error("Error al cargar contraseñas:", error);
      showSnackbar("Error al cargar historial de contraseñas", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAction = async (action: string, password: Password) => {
    try {
      if (action === "view") {
        // Vista de detalles
        console.log("Ver detalles de password:", password);
        showSnackbar(`Viendo contraseña ID: ${password.id}`, "info");
      } else if (action === "delete") {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta contraseña del historial?")) {
          if (password.id) {
            await passwordService.deletePassword(password.id);
            showSnackbar("Contraseña eliminada exitosamente", "success");
            if (userId) {
              fetchPasswords(parseInt(userId));
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error en acción:", error);
      showSnackbar(error.response?.data?.message || "Error al realizar la acción", "error");
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const processedData = passwords.map(pwd => ({
    ...pwd,
    created_at: formatDate(pwd.created_at),
    startAt: formatDate(pwd.startAt),
    endAt: formatDate(pwd.endAt),
    status: pwd.isActive ? 
      <Chip label="Activa" color="success" size="small" /> : 
      <Chip label="Inactiva" color="default" size="small" />
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando historial de contraseñas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Historial de Contraseñas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/passwords/${userId}/crear`)}
        >
          Crear Nueva Contraseña
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Usuario ID: {userId}
          </Typography>
          <Typography color="textSecondary">
            Total de contraseñas en historial: {passwords.length}
          </Typography>
        </CardContent>
      </Card>

      <GenericTable
        data={processedData}
        columns={[
          "id", 
          "created_at", 
          "startAt", 
          "endAt", 
          "status"
        ]}
        columnNames={{
          id: "ID",
          created_at: "Creado",
          startAt: "Inicio",
          endAt: "Expiración",
          status: "Estado"
        }}
        actions={[
          { name: "view", label: "Ver Detalles", color: "info" },
          { name: "delete", label: "Eliminar", color: "error" },
        ]}
        onAction={handleAction}
        title="Contraseñas del Usuario"
      />

      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
        >
          Volver Atrás
        </Button>
      </Box>

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

export default UserPasswordsList;