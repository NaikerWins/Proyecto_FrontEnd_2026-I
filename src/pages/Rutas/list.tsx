import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Container, Typography,
    Alert, Snackbar
} from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Ruta } from "../../models/Ruta";
import { rutaService } from "../../services/rutaService";
import Swal from "sweetalert2";

const ListRutas: React.FC = () => {
    const navigate = useNavigate();
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchRutas();
    }, []);

    const fetchRutas = async () => {
        try {
            const data = await rutaService.getRutas();
            setRutas(data);
        } catch (error) {
            showSnackbar("Error al cargar rutas", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const rutasTabla = rutas.map((r) => ({
        ...r,
        cantidadParaderos: r.nodos?.length || 0,
        activa: r.activa ? "Sí" : "No",
    }));

    const handleAction = async (action: string, item: Record<string, any>) => {
        const ruta = rutas.find((r) => r.id === item.id);
        if (!ruta) return;

        if (action === "ver") {
            navigate(`/rutas/${ruta.id}`);
        } else if (action === "edit") {
            navigate(`/rutas/editar/${ruta.id}`);
        } else if (action === "tiempoTotal") {
            const data = await rutaService.getTiempoTotal(ruta.id!);
            if (data) {
                Swal.fire({
                    title: "Tiempo total estimado",
                    text: `${data.tiempoTotal} ${data.unidad}`,
                    icon: "info",
                });
            }
        } else if (action === "delete") {
            Swal.fire({
                title: "¿Desactivar ruta?",
                text: "La ruta quedará inactiva",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, desactivar",
                cancelButtonText: "Cancelar",
            }).then(async (result) => {
                if (result.isConfirmed && ruta.id) {
                    const success = await rutaService.deleteRuta(ruta.id);
                    if (success) {
                        showSnackbar("Ruta desactivada correctamente", "success");
                        fetchRutas();
                    } else {
                        showSnackbar("Error al desactivar la ruta", "error");
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
                    Gestión de Rutas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/rutas/crear")}
                >
                    Nueva Ruta
                </Button>
            </Box>

            <GenericTable
                data={rutasTabla}
                columns={["id", "nombre", "codigo", "tarifa", "cantidadParaderos", "activa"]}
                columnNames={{
                    id: "ID",
                    nombre: "Nombre",
                    codigo: "Código",
                    tarifa: "Tarifa ($)",
                    cantidadParaderos: "Paraderos",
                    activa: "Activa",
                }}
                actions={[
                    { name: "ver", label: "Ver", color: "info" },
                    { name: "tiempoTotal", label: "Tiempo total", color: "success" },
                    { name: "edit", label: "Editar", color: "primary" },
                    { name: "delete", label: "Desactivar", color: "error" },
                ]}
                onAction={handleAction}
                title="Lista de Rutas"
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

export default ListRutas;