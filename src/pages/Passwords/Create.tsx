import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  Snackbar,
} from "@mui/material";
import { passwordService } from "../../services/passwordService";

const CreatePassword: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [validUserId, setValidUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    content: "",
    startAt: "",
    endAt: ""
  });


  useEffect(() => {
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (!isNaN(parsedUserId)) {
        setValidUserId(parsedUserId);
      } else {
        console.error("❌ userId inválido:", userId);
        showSnackbar("ID de usuario inválido", "error");
      }
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validUserId) {
      showSnackbar("ID de usuario no válido", "error");
      return;
    }

    setLoading(true);

    try {
      // Formatear fechas correctamente para el backend
      const passwordData = {
        content: formData.content,
        startAt: formData.startAt 
          ? new Date(formData.startAt).toISOString().slice(0, 19).replace('T', ' ')
          : new Date().toISOString().slice(0, 19).replace('T', ' '),
        endAt: formData.endAt 
          ? new Date(formData.endAt).toISOString().slice(0, 19).replace('T', ' ')
          : null
      };

      console.log("📤 Enviando datos:", { userId: validUserId, passwordData });

      await passwordService.createPassword(validUserId, passwordData);
      
      setSnackbar({
        open: true,
        message: "Contraseña creada exitosamente",
        severity: "success"
      });

      setTimeout(() => {
        navigate(`/passwords/${validUserId}`);
      }, 2000);

    } catch (error: any) {
      console.error("❌ Error al crear contraseña:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error al crear contraseña. Verifica que el usuario exista.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!validUserId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          ID de usuario no válido. No se puede crear la contraseña.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver Atrás
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crear Nueva Contraseña
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usuario ID: {validUserId}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Contraseña"
                name="content"
                type="password"
                value={formData.content}
                onChange={handleChange}
                required
                variant="outlined"
                helperText="Ingrese la nueva contraseña"
                disabled={loading}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Fecha de Inicio"
                name="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Fecha cuando la contraseña empieza a ser válida (opcional)"
                disabled={loading}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Fecha de Expiración"
                name="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Fecha cuando la contraseña expira (opcional)"
                disabled={loading}
              />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(`/passwords/${validUserId}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Contraseña"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default CreatePassword;