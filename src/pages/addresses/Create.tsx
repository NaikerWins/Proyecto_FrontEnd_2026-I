import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "../../components/Generics/MUI/GenericForm";

import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Button, 
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import { LocationOn, Close, MyLocation } from "@mui/icons-material";
import GenericForm from "../../components/Generics/MUI/GenericForm";
import { Address } from "../../models/Address";
import { addressService } from "../../services/addressService";
import Swal from "sweetalert2";

const CreateAddress: React.FC = () => {
  const navigate = useNavigate();
  const [mapDialog, setMapDialog] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ 
    lat: null, 
    lng: null 
  });

const addressFields: FormField[] = [
  { name: "street", label: "Calle", type: "text", required: true },
  { name: "number", label: "Número", type: "text", required: true },
  { name: "latitude", label: "Latitud", type: "number" },
  { name: "longitude", label: "Longitud", type: "number" },
  { name: "user_id", label: "ID de Usuario", type: "number", required: true },
];

  const initialValues: Partial<Address> = {
    street: "",
    number: "",
    latitude: undefined,
    longitude: undefined,
    user_id: undefined,
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Error",
        text: "La geolocalización no es soportada por este navegador",
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Obteniendo ubicación...",
      text: "Por favor permite el acceso a tu ubicación",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        Swal.close();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });
        Swal.fire({
          title: "Ubicación obtenida",
          text: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          icon: "success",
          timer: 3000
        });
      },
      (error) => {
        Swal.fire({
          title: "Error",
          text: "No se pudo obtener la ubicación: " + error.message,
          icon: "error",
        });
      }
    );
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      console.log("📦 Datos del formulario:", values);
      
      const userId = parseInt(values.user_id);
      
      if (isNaN(userId)) {
        Swal.fire({
          title: "Error",
          text: "El ID de usuario debe ser un número válido",
          icon: "error",
        });
        return;
      }
      const finalLat = coordinates.lat !== null ? coordinates.lat : (values.latitude ? parseFloat(values.latitude) : null);
      const finalLng = coordinates.lng !== null ? coordinates.lng : (values.longitude ? parseFloat(values.longitude) : null);

      const addressData = {
        street: values.street,
        number: values.number,
        latitude: finalLat,
        longitude: finalLng,
        user_id: userId,
      };

      console.log("🚀 Enviando datos al backend:", addressData);

      const address = await addressService.createAddress(userId, addressData);
      
      if (address) {
        Swal.fire({
          title: "Éxito",
          text: "Dirección creada correctamente",
          icon: "success",
          timer: 3000
        });
        navigate("/addresses");
      } else {
        Swal.fire({
          title: "Error",
          text: "Error al crear la dirección",
          icon: "error",
        });
      }
    } catch (error: any) {
      console.error("❌ Error completo:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Error al crear la dirección",
        icon: "error",
      });
    }
  };

  const handleCancel = () => {
    navigate("/addresses");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crear Nueva Dirección
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        💡 <strong>Nota:</strong> Puedes obtener las coordenadas automáticamente o ingresarlas manualmente.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={getCurrentLocation}
          >
            Usar mi ubicación actual
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={() => setMapDialog(true)}
          >
            Seleccionar en mapa
          </Button>
        </Grid>
      </Grid>

      {coordinates.lat && coordinates.lng && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ <strong>Coordenadas obtenidas:</strong> Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
        </Alert>
      )}
      
      <Box sx={{ mt: 3 }}>
        <GenericForm
          title="Información de la Dirección"
          fields={addressFields}
          initialValues={{
            ...initialValues,
            latitude: coordinates.lat || undefined,
            longitude: coordinates.lng || undefined
          }}
          onSubmit={handleSubmit}
          submitLabel="Crear Dirección"
          onCancel={handleCancel}
        />
      </Box>

      <Dialog open={mapDialog} onClose={() => setMapDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Seleccionar ubicación en el mapa</Typography>
            <IconButton onClick={() => setMapDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              🗺️ Selector de Mapa
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Aquí puedes integrar Google Maps API para selección interactiva
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                setCoordinates({ lat: 4.710989, lng: -74.072092 });
                setMapDialog(false);
              }}
              sx={{ mt: 2 }}
            >
              Usar ubicación de ejemplo (Bogotá)
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CreateAddress;