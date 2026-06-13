import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Button, Container, Typography, Grid, Card, CardContent, CardActions, Chip, TextField, Snackbar, Alert, CircularProgress, Badge, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { Group, People, Add } from "@mui/icons-material";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { grupoService } from "../../services/grupoService";
import { Grupo } from "../../models/Grupo";

const ListGrupos: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.user.user);

    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [misGrupos, setMisGrupos] = useState<Grupo[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [publicos, mine] = await Promise.all([
                grupoService.getPublicos(),
                grupoService.getMisGrupos(),
            ]);
            setGrupos(publicos);
            setMisGrupos(mine);
        } catch {
            showSnackbar("Error al cargar grupos", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const esMiembro = (grupoId: number) =>
        misGrupos.some((g) => g.id === grupoId);

    const handleVerDetalle = (grupo: Grupo) => {
        setGrupoSeleccionado(grupo);
        setModalAbierto(true);
    };

    const handleUnirse = async (grupo: Grupo) => {
        const confirm = await Swal.fire({
            title: `¿Unirte a "${grupo.nombre}"?`,
            text: "Recibirás los mensajes de este grupo.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Unirme",
            cancelButtonText: "Cancelar",
        });
        if (!confirm.isConfirmed) return;

        try {
            await grupoService.unirse(grupo.id!);
            setModalAbierto(false);
            await Swal.fire({
                title: `¡Bienvenido a ${grupo.nombre}!`,
                text: "Ya eres miembro del grupo y empezarás a recibir sus mensajes.",
                icon: "success",
                confirmButtonText: "¡Gracias!",
            });
            fetchData();
        } catch (err: any) {
            showSnackbar(err.message ?? "Error al unirse", "error");
        }
    };

    const gruposFiltrados = grupos.filter((g) =>
        g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Encabezado */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Grupos
                </Typography>
                <Badge badgeContent={misGrupos.length} color="primary">
                    <Button
                        variant="outlined"
                        startIcon={<People />}
                        onClick={() => navigate("/grupos/mis-grupos")}
                    >
                        Mis grupos
                    </Button>
                </Badge>
            </Box>

            {/* Buscador */}
            <TextField
                fullWidth
                placeholder="Buscar grupos por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="small"
                sx={{ mb: 3 }}
            />

            {/* Sin resultados */}
            {gruposFiltrados.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                    No se encontraron grupos públicos.
                </Typography>
            )}

            {/* Listado */}
            <Grid container spacing={3}>
                {gruposFiltrados.map((grupo) => (
                    <Grid item xs={12} sm={6} md={4} key={grupo.id}>
                        <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Group color="primary" />
                                    <Typography variant="h6" component="h2" noWrap>
                                        {grupo.nombre}
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2, minHeight: 40 }}
                                >
                                    {grupo.descripcion ?? "Sin descripción"}
                                </Typography>

                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    <Chip
                                        label={grupo.tipo === "PUBLIC" ? "Público" : "Privado"}
                                        size="small"
                                        color={grupo.tipo === "PUBLIC" ? "success" : "default"}
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<People fontSize="small" />}
                                        label={`${grupo.memberCount ?? 0} miembros`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    {esMiembro(grupo.id!) && (
                                        <Chip
                                            label="Ya eres miembro"
                                            size="small"
                                            color="primary"
                                        />
                                    )}
                                </Box>
                            </CardContent>

                            <CardActions sx={{ px: 2, pb: 2 }}>
                                {esMiembro(grupo.id!) ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate(`/grupos/${grupo.id}`)}
                                    >
                                        Ver grupo
                                    </Button>
                                ) : (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleVerDetalle(grupo)}
                                        >
                                            Ver detalle
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleUnirse(grupo)}
                                        >
                                            Unirme
                                        </Button>
                                    </Box>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Modal de detalle */}
            <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{grupoSeleccionado?.nombre}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        {grupoSeleccionado?.descripcion ?? "Sin descripción"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Chip
                            label={grupoSeleccionado?.tipo === "PUBLIC" ? "Público" : "Privado"}
                            size="small"
                            color={grupoSeleccionado?.tipo === "PUBLIC" ? "success" : "default"}
                            variant="outlined"
                        />
                        <Chip
                            icon={<People fontSize="small" />}
                            label={`${grupoSeleccionado?.memberCount ?? 0} miembros`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalAbierto(false)}>Cerrar</Button>
                    {grupoSeleccionado && !esMiembro(grupoSeleccionado.id!) && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setModalAbierto(false);
                                handleUnirse(grupoSeleccionado);
                            }}
                        >
                            Unirme
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ListGrupos;