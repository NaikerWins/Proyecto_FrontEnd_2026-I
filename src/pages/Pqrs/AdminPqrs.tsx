import React, { useEffect, useState } from "react";
import {
    Box, Button, Container, Typography, Card, CardContent,
    Chip, Snackbar, Alert, CircularProgress, Table, TableBody,
    TableCell, TableHead, TableRow, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Paper,
} from "@mui/material";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import apiNest from "../../interceptors/axiosNest";
import { Pqrs } from "../../models/Pqrs";

const ESTADOS = ["RECIBIDO", "EN_REVISION", "EN_PROCESO", "RESUELTO", "CERRADO"];

const estadoColor: Record<string, any> = {
    RECIBIDO: "info",
    EN_REVISION: "warning",
    EN_PROCESO: "warning",
    RESUELTO: "success",
    CERRADO: "default",
};

const AdminPqrs: React.FC = () => {
    const [pqrsList, setPqrsList] = useState<Pqrs[]>([]);
    const [loading, setLoading] = useState(true);
    const [pqrsSeleccionada, setPqrsSeleccionada] = useState<Pqrs | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    useEffect(() => {
        fetchPqrs();
    }, []);

    const fetchPqrs = async () => {
        setLoading(true);
        try {
            const res = await apiNest.get<Pqrs[]>("/pqrs");
            setPqrsList(res.data);
        } catch {
            setSnackbar({ open: true, message: "Error al cargar PQRS", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirModal = (pqrs: Pqrs) => {
        setPqrsSeleccionada(pqrs);
        setNuevoEstado(pqrs.estado ?? "RECIBIDO");
        setRespuesta("");
        setModalAbierto(true);
    };

    const handleCambiarEstado = async () => {
        if (!pqrsSeleccionada || !nuevoEstado) return;
        if (nuevoEstado === "RESUELTO" && !respuesta.trim()) {
            setSnackbar({ open: true, message: "Debes escribir una respuesta al resolver", severity: "error" });
            return;
        }

        setGuardando(true);
        try {
            await apiNest.post(`/pqrs/${pqrsSeleccionada.radicado}/estado`, {
                estado: nuevoEstado,
                respuesta: respuesta || undefined,
            });
            setModalAbierto(false);
            await Swal.fire({
                title: "Estado actualizado",
                text: `La PQRS ${pqrsSeleccionada.radicado} fue actualizada a ${nuevoEstado}. El ciudadano ha sido notificado por email.`,
                icon: "success",
                confirmButtonText: "Aceptar",
            });
            fetchPqrs();
        } catch {
            setSnackbar({ open: true, message: "Error al cambiar estado", severity: "error" });
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Administración de PQRS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gestiona las solicitudes de los ciudadanos y actualiza su estado.
            </Typography>

            <Paper variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: "background.default" }}>
                            <TableCell><strong>Radicado</strong></TableCell>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Categoría</strong></TableCell>
                            <TableCell><strong>Descripción</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell><strong>Fecha límite</strong></TableCell>
                            <TableCell align="right"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pqrsList.map((pqrs) => (
                            <TableRow key={pqrs.id} hover>
                                <TableCell sx={{ fontWeight: 500, fontSize: 12 }}>
                                    {pqrs.radicado}
                                </TableCell>
                                <TableCell>{pqrs.tipo}</TableCell>
                                <TableCell>{pqrs.categoria}</TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>
                                    <Typography variant="body2" noWrap>
                                        {pqrs.descripcion}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ fontSize: 12 }}>{pqrs.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={pqrs.estado}
                                        size="small"
                                        color={estadoColor[pqrs.estado!] ?? "default"}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontSize: 12 }}>
                                    {new Date(pqrs.creadoEn!).toLocaleDateString()}
                                </TableCell>
                                <TableCell sx={{ fontSize: 12 }}>
                                    {new Date(pqrs.fechaLimite!).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleAbrirModal(pqrs)}
                                        disabled={pqrs.estado === "RESUELTO" || pqrs.estado === "CERRADO"}
                                    >
                                        Gestionar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Modal cambiar estado */}
            <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Gestionar PQRS — {pqrsSeleccionada?.radicado}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2">
                            <strong>Tipo:</strong> {pqrsSeleccionada?.tipo}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Categoría:</strong> {pqrsSeleccionada?.categoria}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Descripción:</strong> {pqrsSeleccionada?.descripcion}
                        </Typography>
                    </Box>

                    <TextField
                        select
                        label="Nuevo estado"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        fullWidth
                        size="small"
                    >
                        {ESTADOS.map((e) => (
                            <MenuItem key={e} value={e}>{e.replace("_", " ")}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label={nuevoEstado === "RESUELTO" ? "Respuesta final *" : "Respuesta (opcional)"}
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Escribe la respuesta o comentario para el ciudadano..."
                    />

                    <Typography variant="caption" color="text.secondary">
                        Al guardar, el ciudadano recibirá un email con el nuevo estado.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalAbierto(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleCambiarEstado}
                        disabled={guardando}
                        startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {guardando ? "Guardando..." : "Guardar cambio"}
                    </Button>
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

export default AdminPqrs;