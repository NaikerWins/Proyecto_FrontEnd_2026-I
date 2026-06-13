import React, { useState, useEffect } from "react";
import {
    Box, Button, Container, Typography, TextField,
    Card, CardContent, Snackbar, Alert, CircularProgress,
    MenuItem, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { CalendarMonth, CheckCircle, VideoCall, LocationOn } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { citaService } from "../../services/citaService";

const TIPOS_CONSULTA = [
    "Problema con tarjeta",
    "Reclamo",
    "Reembolso",
    "Otro",
];

const AgendarCita: React.FC = () => {
    const user = useSelector((state: any) => state.user.user);

    const [tipoAtencion, setTipoAtencion] = useState<"PRESENCIAL" | "VIRTUAL">("PRESENCIAL");
    const [eventosOcupados, setEventosOcupados] = useState<{ inicio: Date; fin: Date }[]>([]);
    const [form, setForm] = useState({
        email: user?.email ?? "",
        tipoConsulta: "",
        motivo: "",
        fecha: "",
        horaInicio: "",
    });
    
    const [enviando, setEnviando] = useState(false);
    const [agendada, setAgendada] = useState<{
        fecha: string;
        hora: string;
        tipo: string;
        meetLink?: string;
    } | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        citaService.getDisponibilidad().then((eventos) => {
            const ocupados = eventos.map((e: any) => ({
                inicio: new Date(e.start?.dateTime ?? e.start?.date),
                fin: new Date(e.end?.dateTime ?? e.end?.date),
            }));
            setEventosOcupados(ocupados);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAgendar = async () => {
        if (!form.email || !form.tipoConsulta || !form.motivo || !form.fecha || !form.horaInicio) {
            setSnackbar({ open: true, message: "Completa todos los campos", severity: "error" });
            return;
        }
        if (form.motivo.length > 300) {
            setSnackbar({ open: true, message: "El motivo no puede superar 300 caracteres", severity: "error" });
            return;
        }

        const slotInicio = new Date(`${form.fecha}T${form.horaInicio}:00-05:00`);
        const slotFin = new Date(slotInicio.getTime() + 30 * 60000);

        const hayConflicto = eventosOcupados.some((e) =>
            slotInicio < e.fin && slotFin > e.inicio
        );

        if (hayConflicto) {
            setSnackbar({
                open: true,
                message: "Ese horario ya está ocupado. Por favor selecciona otro.",
                severity: "error",
            });
            return;
        }

        const fechaInicioLocal = `${form.fecha}T${form.horaInicio}:00-05:00`;
        const fin = new Date(`${form.fecha}T${form.horaInicio}:00`);
        fin.setMinutes(fin.getMinutes() + 30);
        const hFin = String(fin.getHours()).padStart(2, "0");
        const mFin = String(fin.getMinutes()).padStart(2, "0");
        const fechaFin = `${form.fecha}T${hFin}:${mFin}:00-05:00`;

        const meetLink = tipoAtencion === "VIRTUAL"
            ? `https://meet.google.com/nuevo-${Math.random().toString(36).slice(2, 8)}`
            : undefined;

        const motivoCompleto = tipoAtencion === "VIRTUAL"
    ? `[VIRTUAL] ${form.tipoConsulta}: ${form.motivo} | Meet: ${meetLink}`
    : `[PRESENCIAL] ${form.tipoConsulta}: ${form.motivo}`;
        console.log("Agendando:", { fechaInicioLocal, fechaFin, motivoCompleto });

        setEnviando(true);
        try {
            await citaService.agendar({
                email: form.email,
                motivo: motivoCompleto,
                fechaInicio: fechaInicioLocal,
                fechaFin,
                meetLink,
            });
            setAgendada({
                fecha: new Date(`${form.fecha}T${form.horaInicio}`).toLocaleDateString("es-CO", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                }),
                hora: `${form.horaInicio} - ${hFin}:${mFin}`,
                tipo: tipoAtencion,
                meetLink,
            });
            // Refrescar eventos ocupados después de agendar
            citaService.getDisponibilidad().then((eventos) => {
                const ocupados = eventos.map((e: any) => ({
                    inicio: new Date(e.start?.dateTime ?? e.start?.date),
                    fin: new Date(e.end?.dateTime ?? e.end?.date),
                }));
                setEventosOcupados(ocupados);
            });
            setForm({ email: user?.email ?? "", tipoConsulta: "", motivo: "", fecha: "", horaInicio: "" });
            setSnackbar({ open: true, message: "Cita agendada correctamente", severity: "success" });
            console.log("Respuesta del servidor:", "OK");
        } catch {
            setSnackbar({ open: true, message: "Error al agendar la cita", severity: "error" });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <CalendarMonth color="primary" fontSize="large" />
                <Typography variant="h4" component="h1">
                    Agendar cita
                </Typography>
            </Box>

            <Card elevation={2}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Confirmación */}
                    {agendada && (
                        <Box sx={{
                            p: 2, bgcolor: "success.light",
                            borderRadius: 1, display: "flex",
                            flexDirection: "column", gap: 1,
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CheckCircle color="success" />
                                <Typography variant="body1" fontWeight={500}>
                                    ¡Cita agendada exitosamente!
                                </Typography>
                            </Box>
                            <Typography variant="body2">
                                <strong>Fecha:</strong> {agendada.fecha}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Hora:</strong> {agendada.hora}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Tipo:</strong> {agendada.tipo === "VIRTUAL" ? "Virtual (videollamada)" : "Presencial (en oficina)"}
                            </Typography>
                            {agendada.meetLink && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <VideoCall fontSize="small" color="primary" />
                                    <Typography variant="body2">
                                        <strong>Enlace Meet:</strong>{" "}
                                        <a href={agendada.meetLink} target="_blank" rel="noreferrer">
                                            {agendada.meetLink}
                                        </a>
                                    </Typography>
                                </Box>
                            )}
                            {agendada.tipo === "PRESENCIAL" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocationOn fontSize="small" color="error" />
                                    <Typography variant="body2">
                                        <strong>Ubicación:</strong> Oficina de Atención al Cliente — Calle 50 #20-15, Manizales
                                    </Typography>
                                </Box>
                            )}
                            <Typography variant="caption" color="text.secondary">
                                Revisa tu correo para la confirmación. Puedes cancelar respondiendo el email.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                sx={{ alignSelf: "flex-start", mt: 1 }}
                                onClick={() => setAgendada(null)}
                            >
                                Cancelar esta cita
                            </Button>
                        </Box>
                    )}

                    {/* Tipo de atención */}
                    <Box>
                        <Typography variant="body2" fontWeight={500} gutterBottom>
                            Tipo de atención *
                        </Typography>
                        <ToggleButtonGroup
                            value={tipoAtencion}
                            exclusive
                            onChange={(_, val) => val && setTipoAtencion(val)}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="PRESENCIAL">
                                <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                                Presencial
                            </ToggleButton>
                            <ToggleButton value="VIRTUAL">
                                <VideoCall fontSize="small" sx={{ mr: 0.5 }} />
                                Virtual
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Tipo de consulta */}
                    <TextField
                        select
                        label="Tipo de consulta *"
                        name="tipoConsulta"
                        value={form.tipoConsulta}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    >
                        {TIPOS_CONSULTA.map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>

                    {/* Motivo */}
                    <TextField
                        label="Motivo de la consulta *"
                        name="motivo"
                        value={form.motivo}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        helperText={`${form.motivo.length}/300 caracteres`}
                        inputProps={{ maxLength: 300 }}
                    />

                    {/* Email */}
                    <TextField
                        label="Correo electrónico *"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        type="email"
                    />

                    {/* Fecha */}
                    <TextField
                        label="Fecha *"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split("T")[0] }}
                    />

                    {/* Hora */}
                    <TextField
                        label="Hora *"
                        name="horaInicio"
                        value={form.horaInicio}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        helperText="La cita tiene una duración de 30 minutos"
                    />

                    <Button
                        variant="contained"
                        startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <CalendarMonth />}
                        onClick={handleAgendar}
                        disabled={enviando}
                        sx={{ alignSelf: "flex-end" }}
                    >
                        {enviando ? "Agendando..." : "Agendar cita"}
                    </Button>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default AgendarCita;