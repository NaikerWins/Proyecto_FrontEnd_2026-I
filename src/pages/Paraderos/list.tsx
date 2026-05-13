import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, Alert, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Paradero } from "../../models/Paradero";
import { paraderoService } from "../../services/paraderoService";
import Swal from "sweetalert2";

const ListParaderos: React.FC = () => {
    const navigate = useNavigate();
    const [paraderos, setParaderos] = useState<Paradero[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchParaderos();
    }, []);

    const fetchParaderos = async () => {
        try {
            const data = await paraderoService.getParaderos();
            setParaderos(data);
        } catch (error) {
            showSnackbar("Error al cargar paraderos", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAction = async (action: string, item: Record<string, any>) => {
        const paradero = paraderos.find((p) => p.id === item.id);
        if (!paradero) return;

        if (action === "edit") {
            navigate(`/paraderos/editar/${paradero.id}`);
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
                if (result.isConfirmed && paradero.id) {
                    const success = await paraderoService.deleteParadero(paradero.id);
                    if (success) {
                        showSnackbar("Paradero eliminado correctamente", "success");
                        fetchParaderos();
                    } else {
                        showSnackbar("Error al eliminar el paradero", "error");
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
                    Gestión de Paraderos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/paraderos/crear")}
                >
                    Nuevo Paradero
                </Button>
            </Box>

            <GenericTable
                data={paraderos}
                columns={["id", "nombre", "codigo", "latitud", "longitud", "clasificacion", "activo"]}
                columnNames={{
                    id: "ID",
                    nombre: "Nombre",
                    codigo: "Código",
                    latitud: "Latitud",
                    longitud: "Longitud",
                    clasificacion: "Clasificación",
                    activo: "Activo",
                }}
                actions={[
                    { name: "edit", label: "Editar", color: "primary" },
                    { name: "delete", label: "Eliminar", color: "error" },
                ]}
                onAction={handleAction}
                title="Lista de Paraderos"
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

export default ListParaderos;