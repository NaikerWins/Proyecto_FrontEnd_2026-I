import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, Alert, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Bus } from "../../models/Bus";
import { busService } from "../../services/busService";
import Swal from "sweetalert2";

const ListBuses: React.FC = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const data = await busService.getBuses();
            setBuses(data);
        } catch (error) {
            showSnackbar("Error al cargar buses", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    // Aplanar datos para la tabla
    const busesTabla = buses.map((bus) => ({
        ...bus,
        empresa: bus.empresa?.nombre || "Sin empresa",
        gpsActivo: bus.gps?.activo ? "Activo" : "Inactivo",
    }));

    const handleAction = async (action: string, item: Record<string, any>) => {
        const bus = buses.find((b) => b.id === item.id);
        if (!bus) return;

        if (action === "edit") {
            navigate(`/buses/editar/${bus.id}`);
        } else if (action === "incidentes") {
            navigate(`/incidentes/bus/${bus.id}`);
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
                if (result.isConfirmed && bus.id) {
                    const success = await busService.deleteBus(bus.id);
                    if (success) {
                        showSnackbar("Bus eliminado correctamente", "success");
                        fetchBuses();
                    } else {
                        showSnackbar("Error al eliminar el bus", "error");
                    }
                }
            });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Buses
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/buses/crear")}
                >
                    Nuevo Bus
                </Button>
            </Box>

            <GenericTable
                data={busesTabla}
                columns={["id", "placa", "modelo", "anio", "capacidadSentados", "capacidadParados", "estado", "empresa", "gpsActivo", "codigoQR"]}
                columnNames={{
                    id: "ID",
                    placa: "Placa",
                    modelo: "Modelo",
                    anio: "Año",
                    capacidadSentados: "Cap. Sentados",
                    capacidadParados: "Cap. Parados",
                    estado: "Estado",
                    empresa: "Empresa",
                    gpsActivo: "GPS",
                    codigoQR: "Código QR",
                }}
                actions={[
                    { name: "edit", label: "Editar", color: "primary" },
                    { name: "incidentes", label: "Incidentes", color: "warning" },
                    { name: "delete", label: "Eliminar", color: "error" },
                ]}
                onAction={handleAction}
                title="Lista de Buses"
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ListBuses;