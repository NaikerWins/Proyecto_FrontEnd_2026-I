import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, Alert, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Conductor } from "../../models/Conductor";
import { conductorService } from "../../services/conductorService";
import Swal from "sweetalert2";

const ListConductores: React.FC = () => {
    const navigate = useNavigate();
    const [conductores, setConductores] = useState<Conductor[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchConductores();
    }, []);

    const fetchConductores = async () => {
        try {
            const data = await conductorService.getConductores();
            setConductores(data);
        } catch (error) {
            showSnackbar("Error al cargar conductores", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const conductoresTabla = conductores.map((c) => ({
        id: c.id,
        licencia: c.licencia,
        nombre: c.persona.nombre,
        apellido: c.persona.apellido,
        email: c.persona.email,
        telefono: c.persona.telefono || "-",
    }));

    const handleAction = async (action: string, item: Record<string, any>) => {
        const conductor = conductores.find((c) => c.id === item.id);
        if (!conductor) return;

        if (action === "edit") {
            navigate(`/conductores/editar/${conductor.id}`);
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
                if (result.isConfirmed && conductor.id) {
                    const success = await conductorService.deleteConductor(conductor.id);
                    if (success) {
                        showSnackbar("Conductor eliminado correctamente", "success");
                        fetchConductores();
                    } else {
                        showSnackbar("Error al eliminar el conductor", "error");
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
                    Gestión de Conductores
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/conductores/crear")}
                >
                    Nuevo Conductor
                </Button>
            </Box>

            <GenericTable
                data={conductoresTabla}
                columns={["id", "licencia", "nombre", "apellido", "email", "telefono"]}
                columnNames={{
                    id: "ID",
                    licencia: "Licencia",
                    nombre: "Nombre",
                    apellido: "Apellido",
                    email: "Email",
                    telefono: "Teléfono",
                }}
                actions={[
                    { name: "edit", label: "Editar", color: "primary" },
                    { name: "delete", label: "Eliminar", color: "error" },
                ]}
                onAction={handleAction}
                title="Lista de Conductores"
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

export default ListConductores;