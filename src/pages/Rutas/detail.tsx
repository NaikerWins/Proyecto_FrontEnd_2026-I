import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container, Typography, Box, Card, CardContent,
    Grid, Divider, Chip, Button, List,
    ListItem, ListItemText, ListItemIcon
} from "@mui/material";
import { ArrowBack, Place, AccessTime, Straighten } from "@mui/icons-material";
import { Ruta } from "../../models/Ruta";
import { rutaService } from "../../services/rutaService";
import Swal from "sweetalert2";

const DetailRuta: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ruta, setRuta] = useState<Ruta | null>(null);
    const [tiempoTotal, setTiempoTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchRuta(Number(id));
    }, [id]);

    const fetchRuta = async (rutaId: number) => {
        try {
            const [rutaData, tiempoData] = await Promise.all([
                rutaService.getRutaById(rutaId),
                rutaService.getTiempoTotal(rutaId),
            ]);

            if (rutaData) {
                // Ordenar nodos por orden
                if (rutaData.nodos) {
                    rutaData.nodos.sort((a, b) => a.orden - b.orden);
                }
                setRuta(rutaData);
            } else {
                Swal.fire({ title: "Error", text: "Ruta no encontrada", icon: "error" });
                navigate("/rutas");
            }

            if (tiempoData) {
                setTiempoTotal(tiempoData.tiempoTotal);
            }
        } catch (error) {
            navigate("/rutas");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!ruta) return <Typography>Ruta no encontrada</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/rutas")}>
                    Volver
                </Button>
                <Typography variant="h4" component="h1">
                    {ruta.nombre}
                </Typography>
                <Chip
                    label={ruta.activa ? "Activa" : "Inactiva"}
                    color={ruta.activa ? "success" : "error"}
                />
            </Box>

            <Grid container spacing={3}>
                {/* Info general */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Información General
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Código:</Typography>
                                    <Typography fontWeight="bold">{ruta.codigo}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Tarifa:</Typography>
                                    <Typography fontWeight="bold">${ruta.tarifa}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Paraderos:</Typography>
                                    <Typography fontWeight="bold">{ruta.nodos?.length || 0}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography color="text.secondary">Tiempo total:</Typography>
                                    <Typography fontWeight="bold">
                                        {tiempoTotal !== null ? `${tiempoTotal} min` : "-"}
                                    </Typography>
                                </Box>
                                {ruta.descripcion && (
                                    <Box>
                                        <Typography color="text.secondary">Descripción:</Typography>
                                        <Typography>{ruta.descripcion}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Paraderos en orden */}
                <Grid item xs={12} md={8}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recorrido (en orden)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List>
                                {ruta.nodos?.map((nodo, index) => (
                                    <React.Fragment key={nodo.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: "50%",
                                                        bgcolor: index === 0 || index === (ruta.nodos!.length - 1)
                                                            ? "primary.main"
                                                            : "grey.400",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {nodo.orden}
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Place fontSize="small" color="action" />
                                                        <Typography fontWeight="bold">
                                                            {nodo.paradero?.nombre || `Paradero ${nodo.orden}`}
                                                        </Typography>
                                                        <Chip
                                                            label={nodo.paradero?.clasificacion}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                                        {nodo.distanciaDesdeAnterior && (
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                <Straighten fontSize="small" />
                                                                <Typography variant="caption">
                                                                    {nodo.distanciaDesdeAnterior} km desde anterior
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {nodo.tiempoEstimado && (
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                <AccessTime fontSize="small" />
                                                                <Typography variant="caption">
                                                                    {nodo.tiempoEstimado} min
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < (ruta.nodos?.length || 0) - 1 && (
                                            <Box sx={{ ml: 3, borderLeft: "2px dashed #e0e0e0", height: 20 }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DetailRuta;