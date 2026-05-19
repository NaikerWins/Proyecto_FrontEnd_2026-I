import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box, Button, Container, Typography, Alert,
    Snackbar, Card, CardContent, Grid, Chip, Divider,
    TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Incidente, EstadisticasIncidente } from "../../models/Incidente";
import { incidenteService } from "../../services/incidenteService";
import Swal from "sweetalert2";

const ListIncidentes: React.FC = () => {
    const navigate = useNavigate();
    const { busId } = useParams<{ busId: string }>();
    const [incidentes, setIncidentes] = useState<Incidente[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasIncidente | null>(null);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        if (busId) fetchIncidentes();
    }, [busId, filtroTipo, filtroEstado]);

    const fetchIncidentes = async () => {
        try {
            const data = await incidenteService.getIncidentesByBus(
                Number(busId),
                filtroTipo || undefined,
                filtroEstado || undefined,
            );
            setIncidentes(data.incidentes);
            setEstadisticas(data.estadisticas);
        } catch (error) {
            showSnackbar("Error al cargar incidentes", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    // Aplanar datos para la tabla
    const incidentesTabla = incidentes.map((inc) => ({
        ...inc,
        conductorNombre: inc.conductor
            ? `${inc.conductor.persona.nombre} ${inc.conductor.persona.apellido}`
            : "Sin conductor",
        cantidadFotos: inc.fotos?.length || 0,
        fecha: inc.fecha ? new Date(inc.fecha).toLocaleString() : "-",
    }));

    const handleAction = async (action: string, item: Record<string, any>) => {
        if (action === "ver") {
            navigate(`/incidentes/${item.id}`);
        } else if (action === "cambiarEstado") {
            const { value: nuevoEstado } = await Swal.fire({
                title: "Cambiar estado",
                input: "select",
                inputOptions: {
                    pendiente: "Pendiente",
                    en_revision: "En revisión",
                    resuelto: "Resuelto",
                },
                inputPlaceholder: "Seleccione estado",
                showCancelButton: true,
                confirmButtonText: "Cambiar",
                cancelButtonText: "Cancelar",
            });

            if (nuevoEstado) {
                const updated = await incidenteService.updateEstado(item.id, nuevoEstado);
                if (updated) {
                    showSnackbar("Estado actualizado correctamente", "success");
                    fetchIncidentes();
                } else {
                    showSnackbar("Error al actualizar estado", "error");
                }
            }
        } else if (action === "comentar") {
            navigate(`/incidentes/${item.id}/comentarios`);
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Incidentes del Bus
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate(`/incidentes/crear/${busId}`)}
                >
                    Reportar Incidente
                </Button>
            </Box>

            {/* Estadísticas */}
            {estadisticas && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">
                                    Total incidentes
                                </Typography>
                                <Typography variant="h3">{estadisticas.total}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">
                                    Tasa de resolución
                                </Typography>
                                <Typography variant="h3">{estadisticas.tasaResolucion}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Por tipo
                                </Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => (
                                        <Chip
                                            key={tipo}
                                            label={`${tipo.replace("_", " ")}: ${cantidad}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filtros */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrar por tipo</InputLabel>
                    <Select
                        value={filtroTipo}
                        label="Filtrar por tipo"
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="accidente_menor">Accidente menor</MenuItem>
                        <MenuItem value="falla_mecanica">Falla mecánica</MenuItem>
                        <MenuItem value="congestion_inesperada">Congestión inesperada</MenuItem>
                        <MenuItem value="problema_pasajeros">Problema con pasajeros</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrar por estado</InputLabel>
                    <Select
                        value={filtroEstado}
                        label="Filtrar por estado"
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="pendiente">Pendiente</MenuItem>
                        <MenuItem value="en_revision">En revisión</MenuItem>
                        <MenuItem value="resuelto">Resuelto</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <GenericTable
                data={incidentesTabla}
                columns={["id", "tipo", "gravedad", "estado", "conductorNombre", "cantidadFotos", "notificadoSupervisor", "fecha"]}
                columnNames={{
                    id: "ID",
                    tipo: "Tipo",
                    gravedad: "Gravedad",
                    estado: "Estado",
                    conductorNombre: "Conductor",
                    cantidadFotos: "Fotos",
                    notificadoSupervisor: "Notif. Supervisor",
                    fecha: "Fecha",
                }}
                actions={[
                    { name: "ver", label: "Ver", color: "info" },
                    { name: "cambiarEstado", label: "Estado", color: "warning" },
                    { name: "comentar", label: "Comentarios", color: "primary" },
                ]}
                onAction={handleAction}
                title="Lista de Incidentes"
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

export default ListIncidentes;