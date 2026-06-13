import React, { useEffect, useState } from "react";
import {
    Box, Button, Container, Typography, Card, CardContent,
    Switch, FormControlLabel, TextField, Snackbar, Alert,
    CircularProgress, Divider, Avatar,
} from "@mui/material";
import { Person, WbSunny } from "@mui/icons-material";
import { useSelector } from "react-redux";
import apiNest from "../../interceptors/axiosNest";

const Perfil: React.FC = () => {
    const user = useSelector((state: any) => state.user.user);

    const [alertasActivas, setAlertasActivas] = useState(true);
    const [horarioViaje, setHorarioViaje] = useState("07:00");
    const [email, setEmail] = useState(user?.email ?? "");
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    useEffect(() => {
        if (user?.id) {
            apiNest.get(`/preferencias-clima/${user.id}`)
                .then((res) => {
                    if (res.data) {
                        setAlertasActivas(res.data.alertasActivas);
                        setHorarioViaje(res.data.horarioViaje);
                        setEmail(res.data.email || user?.email || "");
                    }
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleGuardar = async () => {
        if (!email) {
            setSnackbar({ open: true, message: "El email es requerido", severity: "error" });
            return;
        }
        setGuardando(true);
        try {
            await apiNest.post(`/preferencias-clima/${user?.id}`, {
                alertasActivas,
                horarioViaje,
                email,
            });
            setSnackbar({ open: true, message: "Preferencias guardadas correctamente", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Error al guardar preferencias", severity: "error" });
        } finally {
            setGuardando(false);
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
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Mi perfil
            </Typography>

            {/* Info del usuario */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                        <Person fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{user?.name ?? "Usuario"}</Typography>
                        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role ?? "Ciudadano"}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Preferencias de clima */}
            <Card elevation={2}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WbSunny color="warning" />
                        <Typography variant="h6">Alertas de clima</Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        Recibe notificaciones diarias sobre el clima de Manizales antes de tu hora habitual de viaje.
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={alertasActivas}
                                onChange={(e) => setAlertasActivas(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={alertasActivas ? "Alertas activadas" : "Alertas desactivadas"}
                    />

                    {alertasActivas && (
                        <>
                            <Divider />
                            <TextField
                                label="Horario habitual de viaje"
                                type="time"
                                value={horarioViaje}
                                onChange={(e) => setHorarioViaje(e.target.value)}
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText="La alerta se enviará 2 horas antes de esta hora"
                            />

                            <TextField
                                label="Email para recibir alertas"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="small"
                                fullWidth
                            />
                        </>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleGuardar}
                        disabled={guardando}
                        startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ alignSelf: "flex-end" }}
                    >
                        {guardando ? "Guardando..." : "Guardar preferencias"}
                    </Button>
                </CardContent>
            </Card>

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

export default Perfil;