import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, LocationOn, Close } from "@mui/icons-material";
import { Address, AddressUtils } from "../../models/Address";
import { addressService } from "../../services/addressService";
import Swal from "sweetalert2";

const ListAddresses: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });
  const [mapDialog, setMapDialog] = useState({ open: false, address: null as Address | null });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const addressesData = await addressService.getAddresses();
      setAddresses(addressesData);
    } catch (error) {
      showSnackbar("Error al cargar direcciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async (address: Address) => {
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
      if (result.isConfirmed && address.id) {
        const success = await addressService.deleteAddress(address.id);
        if (success) {
          showSnackbar("Dirección eliminada correctamente", "success");
          fetchAddresses();
        } else {
          showSnackbar("Error al eliminar la dirección", "error");
        }
      }
    });
  };

  const openMapDialog = (address: Address) => {
    setMapDialog({ open: true, address });
  };

  const closeMapDialog = () => {
    setMapDialog({ open: false, address: null });
  };

  const openInGoogleMaps = (address: Address) => {
    const mapsUrl = AddressUtils.getGoogleMapsUrl(address);
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Direcciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/addresses/crear")}
        >
          Nueva Dirección
        </Button>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {address.street} {address.number}
                </Typography>
                
                {/* Coordenadas con botón de mapa */}
                {(address.latitude && address.longitude) ? (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<LocationOn />}
                      label={`📍 ${address.latitude.toFixed(6)}, ${address.longitude.toFixed(6)}`}
                      variant="outlined"
                      color="primary"
                      onClick={() => openMapDialog(address)}
                      clickable
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Coordenadas precisas disponibles
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<LocationOn />}
                      label="📍 Ver en Google Maps"
                      variant="outlined"
                      color="secondary"
                      onClick={() => openInGoogleMaps(address)}
                      clickable
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Ubicación aproximada por dirección
                    </Typography>
                  </Box>
                )}
                
                {/* Información de usuario */}
                <Typography variant="body2">
                  <strong>Usuario ID:</strong> {address.user_id || "No asignado"}
                </Typography>
                
                {/* Fechas */}
                {address.created_at && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Creado:</strong> {new Date(address.created_at).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/addresses/editar/${address.id}`)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  startIcon={<LocationOn />}
                  onClick={() => AddressUtils.hasValidCoordinates(address) ? openMapDialog(address) : openInGoogleMaps(address)}
                >
                  {AddressUtils.hasValidCoordinates(address) ? 'Ver Mapa' : 'Abrir Maps'}
                </Button>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  color="error"
                  onClick={() => handleDelete(address)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de Mapa */}
      <Dialog 
        open={mapDialog.open} 
        onClose={closeMapDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Ubicación en el Mapa
            </Typography>
            <IconButton onClick={closeMapDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {mapDialog.address && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Dirección:</strong> {mapDialog.address.street} {mapDialog.address.number}
              </Typography>
              {mapDialog.address.latitude && mapDialog.address.longitude && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Coordenadas:</strong> {mapDialog.address.latitude.toFixed(6)}, {mapDialog.address.longitude.toFixed(6)}
                </Typography>
              )}
              
              <Box sx={{ mt: 2, height: '400px', width: '100%' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={AddressUtils.getEmbeddedMapUrl(mapDialog.address)}
                />
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  onClick={() => mapDialog.address && openInGoogleMaps(mapDialog.address)}
                >
                  Abrir en Google Maps
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {addresses.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No hay direcciones registradas
          </Typography>
        </Box>
      )}

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

export default ListAddresses;