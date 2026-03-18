import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm from "../../components/Generics/MUI/GenericForm";
import { Address } from "../../models/Address";
import { addressService } from "../../services/addressService";
import Swal from "sweetalert2";

const UpdateAddress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAddress(parseInt(id));
    }
  }, [id]);

  const fetchAddress = async (addressId: number) => {
    try {
      const addressData = await addressService.getAddressById(addressId);
      if (addressData) {
        setAddress(addressData);
      } else {
        Swal.fire({
          title: "Error",
          text: "Dirección no encontrada",
          icon: "error",
        });
        navigate("/addresses");
      }
    } catch (error) {
      console.error("Error al cargar dirección:", error);
      Swal.fire({
        title: "Error",
        text: "Error al cargar la dirección",
        icon: "error",
      });
      navigate("/addresses");
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    { name: "street", label: "Calle", type: "text", required: true },
    { name: "number", label: "Número", type: "text", required: true },
    { name: "latitude", label: "Latitud", type: "number" },
    { name: "longitude", label: "Longitud", type: "number" },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      if (address?.id) {
        const processedValues = {
          street: values.street,
          number: values.number,
          latitude: values.latitude ? parseFloat(values.latitude) : null,
          longitude: values.longitude ? parseFloat(values.longitude) : null,
        };

        const updatedAddress = await addressService.updateAddress(address.id, processedValues);
        if (updatedAddress) {
          Swal.fire({
            title: "Éxito",
            text: "Dirección actualizada correctamente",
            icon: "success",
            timer: 3000
          });
          navigate("/addresses");
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al actualizar la dirección",
            icon: "error",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al actualizar la dirección",
        icon: "error",
      });
    }
  };

  const handleCancel = () => {
    navigate("/addresses");
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (!address) {
    return <Typography>Dirección no encontrada</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Actualizar Dirección
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <GenericForm
          title="Información de la Dirección"
          fields={addressFields}
          initialValues={address}
          onSubmit={handleSubmit}
          submitLabel="Actualizar Dirección"
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
};

export default UpdateAddress;