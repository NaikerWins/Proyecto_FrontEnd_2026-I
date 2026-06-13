import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Button, Container, Typography, Grid, Card, CardContent, CardActions, Chip, Snackbar, Alert,CircularProgress} from "@mui/material";
import { Group, People, ArrowBack } from "@mui/icons-material";
import { grupoService } from "../../services/grupoService";
import { Grupo } from "../../models/Grupo";

const MisGrupos: React.FC = () => {
    const navigate = useNavigate();
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    useEffect(() => {
        fetchMisGrupos();
    }, []);

    const fetchMisGrupos = async () => {
        setLoading(true);
        try {
            const data = await grupoService.getMisGrupos();
            setGrupos(data);
        } catch {
            setSnackbar({ open: true, message: "Error al cargar tus grupos", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/grupos")}>
                    Volver
                </Button>
                <Typography variant="h4" component="h1">
                    Mis grupos
                </Typography>
            </Box>

            {grupos.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                    <Typography color="text.secondary" gutterBottom>
                        Aún no perteneces a ningún grupo.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/grupos")}>
                        Explorar grupos
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {grupos.map((grupo) => (
                        <Grid item xs={12} sm={6} md={4} key={grupo.id}>
                            <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Group color="primary" />
                                        <Typography variant="h6" noWrap>
                                            {grupo.nombre}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {grupo.descripcion ?? "Sin descripción"}
                                    </Typography>
                                    <Chip
                                        icon={<People fontSize="small" />}
                                        label={`${grupo.memberCount ?? 0} miembros`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate(`/grupos/${grupo.id}`)}
                                    >
                                        Abrir grupo
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

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

export default MisGrupos;