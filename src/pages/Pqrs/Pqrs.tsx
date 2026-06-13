import React, { useState } from "react";
import {
    Box, Button, Container, Typography, TextField,
    MenuItem, Snackbar, Alert, Card, CardContent,
    Divider, Chip, CircularProgress, Tabs, Tab, IconButton,
} from "@mui/material";
import { Search, Send, CheckCircle } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { pqrsService } from "../../services/pqrsService";
import { Pqrs } from "../../models/Pqrs";
import apiNest from "../../interceptors/axiosNest";

const TIPOS = ["PETICION", "QUEJA", "RECLAMO", "SUGERENCIA"];
const CATEGORIAS = ["Conductor", "Bus", "Ruta", "Tarjeta", "Otro"];

const estadoColor: Record<string, any> = {
    RECIBIDO: "info",
    EN_PROCESO: "warning",
    RESUELTO: "success",
    CERRADO: "default",
};

const PqrsPage: React.FC = () => {
    const user = useSelector((state: any) => state.user.user);
    const [tab, setTab] = useState(0);

    const [form, setForm] = useState({
        tipo: "",
        categoria: "",
        descripcion: "",
        email: user?.email ?? "",
    });
    const [fotos, setFotos] = useState<File[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [radicadoCreado, setRadicadoCreado] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    const [radicadoBusqueda, setRadicadoBusqueda] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [pqrsEncontrada, setPqrsEncontrada] = useState<Pqrs | null>(null);
    const [noEncontrada, setNoEncontrada] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivos = Array.from(e.target.files ?? []);
        if (archivos.length + fotos.length > 3) {
            setSnackbar({ open: true, message: "Máximo 3 fotos permitidas", severity: "error" });
            return;
        }
        setFotos((prev) => [...prev, ...archivos].slice(0, 3));
    };

    const handleEliminarFoto = (index: number) => {
        setFotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEnviar = async () => {
        if (!form.tipo || !form.categoria || !form.descripcion || !form.email) {
            setSnackbar({ open: true, message: "Completa todos los campos", severity: "error" });
            return;
        }
        if (form.descripcion.length > 500) {
            setSnackbar({ open: true, message: "La descripción no puede superar 500 caracteres", severity: "error" });
            return;
        }

        setEnviando(true);
        try {
            const n8nRes = await apiNest.post('/pqrs/notificar', {
                tipo: form.tipo,
                categoria: form.categoria,
                descripcion: form.descripcion,
                email: form.email,
            });

            const radicadoN8N = n8nRes.data?.radicado;

            const resultado = await pqrsService.createConRadicado({
                ...form,
                ciudadanoId: user?.id,
                radicado: radicadoN8N,
            });

            setRadicadoCreado(resultado.radicado!);
            setForm({ tipo: "", categoria: "", descripcion: "", email: user?.email ?? "" });
            setFotos([]);
            setSnackbar({ open: true, message: "PQRS enviada correctamente", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Error al enviar la PQRS", severity: "error" });
        } finally {
            setEnviando(false);
        }
    };

    const handleConsultar = async () => {
        if (!radicadoBusqueda.trim()) return;
        setBuscando(true);
        setPqrsEncontrada(null);
        setNoEncontrada(false);
        try {
            const resultado = await pqrsService.findByRadicado(radicadoBusqueda.trim());
            if (resultado) {
                setPqrsEncontrada(resultado);
            } else {
                setNoEncontrada(true);
            }
        } catch {
            setNoEncontrada(true);
        } finally {
            setBuscando(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                PQRS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Peticiones, Quejas, Reclamos y Sugerencias
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Crear PQRS" />
                <Tab label="Consultar estado" />
            </Tabs>

            {/* TAB FORMULARIO */}
            {tab === 0 && (
                <Card elevation={2}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                        {radicadoCreado && (
                            <Box sx={{
                                p: 2, bgcolor: "success.light", borderRadius: 1,
                                display: "flex", alignItems: "center", gap: 1,
                            }}>
                                <CheckCircle color="success" />
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        PQRS enviada exitosamente
                                    </Typography>
                                    <Typography variant="body2">
                                        Número de radicado: <strong>{radicadoCreado}</strong>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Guarda este número para consultar el estado. Revisa tu correo para más detalles.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <TextField
                            select
                            label="Tipo *"
                            name="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        >
                            {TIPOS.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Categoría *"
                            name="categoria"
                            value={form.categoria}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        >
                            {CATEGORIAS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Descripción *"
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            size="small"
                            helperText={`${form.descripcion.length}/500 caracteres`}
                            inputProps={{ maxLength: 500 }}
                        />

                        <TextField
                            label="Correo electrónico *"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            type="email"
                        />

                        {/* Fotos */}
                        <Box>
                            <Typography variant="body2" fontWeight={500} gutterBottom>
                                Adjuntar fotos (máximo 3)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                disabled={fotos.length >= 3}
                            >
                                Seleccionar fotos
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    multiple
                                    onChange={handleFotos}
                                />
                            </Button>
                            {fotos.length > 0 && (
                                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                                    {fotos.map((foto, index) => (
                                        <Box key={index} sx={{ position: "relative" }}>
                                            <img
                                                src={URL.createObjectURL(foto)}
                                                alt={`foto-${index}`}
                                                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEliminarFoto(index)}
                                                sx={{
                                                    position: "absolute", top: -8, right: -8,
                                                    bgcolor: "error.main", color: "white",
                                                    width: 20, height: 20,
                                                    "&:hover": { bgcolor: "error.dark" },
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 12, lineHeight: 1 }}>×</Typography>
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <Send />}
                            onClick={handleEnviar}
                            disabled={enviando}
                            sx={{ alignSelf: "flex-end" }}
                        >
                            {enviando ? "Enviando..." : "Enviar PQRS"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* TAB CONSULTA */}
            {tab === 1 && (
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Ingresa el número de radicado para consultar el estado de tu PQRS.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Ej: PQRS-2026-899850"
                                value={radicadoBusqueda}
                                onChange={(e) => setRadicadoBusqueda(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleConsultar()}
                            />
                            <Button
                                variant="contained"
                                startIcon={buscando ? <CircularProgress size={16} color="inherit" /> : <Search />}
                                onClick={handleConsultar}
                                disabled={buscando}
                            >
                                Consultar
                            </Button>
                        </Box>

                        {noEncontrada && (
                            <Alert severity="warning">
                                No se encontró ninguna PQRS con ese número de radicado.
                            </Alert>
                        )}

                        {pqrsEncontrada && (
                            <Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography variant="h6">{pqrsEncontrada.radicado}</Typography>
                                    <Chip
                                        label={pqrsEncontrada.estado}
                                        color={estadoColor[pqrsEncontrada.estado!] ?? "default"}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Tipo:</strong> {pqrsEncontrada.tipo}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Categoría:</strong> {pqrsEncontrada.categoria}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Descripción:</strong> {pqrsEncontrada.descripcion}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Fecha de radicado:</strong>{" "}
                                        {new Date(pqrsEncontrada.creadoEn!).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Fecha límite de respuesta:</strong>{" "}
                                        {new Date(pqrsEncontrada.fechaLimite!).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

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

export default PqrsPage;