import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container, Typography, Box, Card, CardContent,
    Grid, Chip, Divider, TextField, Button,
    List, ListItem, ListItemText, Alert
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Incidente } from "../../models/Incidente";
import { incidenteService } from "../../services/incidenteService";
import Swal from "sweetalert2";

const DetailIncidente: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [incidente, setIncidente] = useState<Incidente | null>(null);
    const [loading, setLoading] = useState(true);
    const [comentario, setComentario] = useState({ contenido: "", autor: "" });
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    useEffect(() => {
        if (id) fetchIncidente(Number(id));
    }, [id]);

    const fetchIncidente = async (incidenteId: number) => {
        try {
            const data = await incidenteService.getIncidenteById(incidenteId);
            if (data) {
                setIncidente(data);
            } else {
                Swal.fire({ title: "Error", text: "Incidente no encontrado", icon: "error" });
                navigate(-1);
            }
        } catch (error) {
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const getGravedadColor = (gravedad: string): any => {
        const colores: Record<string, any> = {
            bajo: "success",
            medio: "warning",
            alto: "error",
            critico: "error",
        };
        return colores[gravedad] || "default";
    };

    const getEstadoColor = (estado: string): any => {
        const colores: Record<string, any> = {
            pendiente: "warning",
            en_revision: "info",
            resuelto: "success",
        };
        return colores[estado] || "default";
    };

    const handleAgregarComentario = async () => {
        if (!comentario.contenido.trim() || !comentario.autor.trim()) {
            Swal.fire({ title: "Error", text: "Complete todos los campos del comentario", icon: "error" });
            return;
        }
        try {
            setEnviandoComentario(true);
            const nuevo = await incidenteService.agregarComentario(Number(id), comentario);
            if (nuevo) {
                Swal.fire({ title: "Éxito", text: "Comentario agregado", icon: "success", timer: 2000 });
                setComentario({ contenido: "", autor: "" });
                fetchIncidente(Number(id));
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al agregar comentario", icon: "error" });
        } finally {
            setEnviandoComentario(false);
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!incidente) return <Typography>Incidente no encontrado</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                    Volver
                </Button>
                <Typography variant="h4" component="h1">
                    Detalle del Incidente #{incidente.id}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Info principal */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Información General</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Tipo:</Typography>
                                    <Typography>{incidente.tipo?.replace(/_/g, " ")}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Gravedad:</Typography>
                                    <Chip label={incidente.gravedad} color={getGravedadColor(incidente.gravedad || "")} size="small" />
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Estado:</Typography>
                                    <Chip label={incidente.estado} color={getEstadoColor(incidente.estado || "")} size="small" />
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Bus:</Typography>
                                    <Typography>{incidente.bus?.placa || "-"}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Conductor:</Typography>
                                    <Typography>
                                        {incidente.conductor
                                            ? `${incidente.conductor.persona.nombre} ${incidente.conductor.persona.apellido}`
                                            : "-"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Fecha:</Typography>
                                    <Typography>
                                        {incidente.fecha ? new Date(incidente.fecha).toLocaleString() : "-"}
                                    </Typography>
                                </Box>
                                {incidente.notificadoSupervisor && (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                        Supervisor notificado
                                    </Alert>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Descripción y fotos */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Descripción</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography>{incidente.descripcion}</Typography>

                            {incidente.fotos && incidente.fotos.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>Fotografías</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={1}>
                                        {incidente.fotos.map((foto, index) => (
                                            <Grid item xs={6} key={index}>
                                                <Box
                                                    component="img"
                                                    src={foto.url}
                                                    alt={`Foto ${index + 1}`}
                                                    sx={{
                                                        width: "100%",
                                                        height: 120,
                                                        objectFit: "cover",
                                                        borderRadius: 1,
                                                        border: "1px solid #e0e0e0",
                                                    }}
                                                    onError={(e: any) => {
                                                        e.target.src = "https://via.placeholder.com/150?text=Sin+imagen";
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Comentarios */}
                <Grid item xs={12}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Comentarios de seguimiento
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {incidente.comentarios && incidente.comentarios.length > 0 ? (
                                <List>
                                    {incidente.comentarios.map((com, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                            <Typography fontWeight="bold">{com.autor}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {com.fecha ? new Date(com.fecha).toLocaleString() : ""}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={com.contenido}
                                                />
                                            </ListItem>
                                            {index < (incidente.comentarios?.length || 0) - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary">Sin comentarios aún</Typography>
                            )}

                            {/* Agregar comentario */}
                            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Agregar comentario
                                </Typography>
                                <TextField
                                    label="Autor"
                                    value={comentario.autor}
                                    onChange={(e) => setComentario({ ...comentario, autor: e.target.value })}
                                    size="small"
                                    fullWidth
                                />
                                <TextField
                                    label="Comentario"
                                    value={comentario.contenido}
                                    onChange={(e) => setComentario({ ...comentario, contenido: e.target.value })}
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAgregarComentario}
                                    disabled={enviandoComentario}
                                    sx={{ alignSelf: "flex-end" }}
                                >
                                    {enviandoComentario ? "Enviando..." : "Agregar comentario"}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DetailIncidente;