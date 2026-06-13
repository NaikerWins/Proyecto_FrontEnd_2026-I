import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box, Button, Container, Typography, Card, CardContent,
    Chip, Snackbar, Alert, CircularProgress, Divider,
    Table, TableBody, TableCell, TableHead, TableRow,
    IconButton, Tooltip, TextField, Paper,
} from "@mui/material";
import {
    ArrowBack, ExitToApp, AdminPanelSettings,
    PersonRemove, Block, People, History,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { grupoService } from "../../services/grupoService";
import { Grupo, MiembroGrupo } from "../../models/Grupo";

interface LogEntry {
    accion: string;
    usuario: string;
    realizadoPor: string;
    fecha: string;
}

const DetalleGrupo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.user.user);

    const [grupo, setGrupo] = useState<Grupo | null>(null);
    const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as any });

    const grupoId = Number(id);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [misGrupos, miembrosData] = await Promise.all([
                grupoService.getMisGrupos(),
                grupoService.getMiembros(grupoId),
            ]);
            const encontrado = misGrupos.find((g) => g.id === grupoId) ?? null;
            setGrupo(encontrado);
            setMiembros(miembrosData);
        } catch {
            showSnackbar("Error al cargar el grupo", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const agregarLog = (accion: string, usuario: string) => {
        setLog((prev) => [
            {
                accion,
                usuario,
                realizadoPor: user?.id ?? "admin",
                fecha: new Date().toLocaleTimeString(),
            },
            ...prev,
        ]);
    };

    const soyAdmin = miembros.some(
        (m) => m.usuarioId === user?.id && m.rol === "ADMIN"
    );

    const handleSalir = async () => {
        const confirm = await Swal.fire({
            title: "¿Abandonar el grupo?",
            text: "Dejarás de recibir mensajes. Los administradores serán notificados.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Abandonar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });
        if (!confirm.isConfirmed) return;

        try {
            await grupoService.salir(grupoId);
            await Swal.fire({
                title: "Has abandonado el grupo",
                html: `
                    <p>Ya no eres miembro de <strong>${grupo?.nombre}</strong>.</p>                
                `,
                icon: "info",
                confirmButtonText: "Aceptar",
            });
            navigate("/grupos/mis-grupos");
        } catch (err: any) {
            showSnackbar(err.message ?? "Error al salir", "error");
        }
    };

    const handlePromover = async (miembro: MiembroGrupo) => {
        const confirm = await Swal.fire({
            title: `¿Promover a administrador?`,
            text: `El usuario ${miembro.usuarioId} tendrá permisos de administrador.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Promover",
            cancelButtonText: "Cancelar",
        });
        if (!confirm.isConfirmed) return;

        try {
            await grupoService.promover(grupoId, miembro.usuarioId);
            agregarLog("Promovido a administrador", miembro.usuarioId);
            showSnackbar("Miembro promovido a administrador", "success");
            fetchData();
        } catch (err: any) {
            showSnackbar(err.message ?? "Error al promover", "error");
        }
    };

    const handleRemover = async (miembro: MiembroGrupo) => {
        const confirm = await Swal.fire({
            title: `¿Remover del grupo?`,
            text: `El usuario ${miembro.usuarioId} será removido y dejará de recibir mensajes.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Remover",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });
        if (!confirm.isConfirmed) return;

        try {
            await grupoService.remover(grupoId, miembro.usuarioId);
            agregarLog("Removido del grupo", miembro.usuarioId);
            await Swal.fire({
                title: "Miembro removido",
                text: `El usuario ${miembro.usuarioId} ha sido notificado y ya no recibirá mensajes del grupo.`,
                icon: "info",
                confirmButtonText: "Aceptar",
            });
            fetchData();
        } catch (err: any) {
            showSnackbar(err.message ?? "Error al remover", "error");
        }
    };

    const handleBloquear = async (miembro: MiembroGrupo) => {
        const confirm = await Swal.fire({
            title: `¿Bloquear usuario?`,
            text: `El usuario ${miembro.usuarioId} no podrá volver a unirse al grupo.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Bloquear",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });
        if (!confirm.isConfirmed) return;

        try {
            await grupoService.bloquear(grupoId, miembro.usuarioId);
            agregarLog("Bloqueado del grupo", miembro.usuarioId);
            showSnackbar("Miembro bloqueado", "success");
            fetchData();
        } catch (err: any) {
            showSnackbar(err.message ?? "Error al bloquear", "error");
        }
    };

    const miembrosFiltrados = miembros.filter((m) =>
        m.usuarioId.toLowerCase().includes(busqueda.toLowerCase())
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/grupos/mis-grupos")}>
                    Volver
                </Button>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    {grupo?.nombre ?? `Grupo ${id}`}
                </Typography>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToApp />}
                    onClick={handleSalir}
                >
                    Abandonar grupo
                </Button>
            </Box>

            {/* Info del grupo */}
            {grupo && (
                <Card elevation={1} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {grupo.descripcion ?? "Sin descripción"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                                label={grupo.tipo === "PUBLIC" ? "Público" : "Privado"}
                                size="small"
                                color={grupo.tipo === "PUBLIC" ? "success" : "default"}
                                variant="outlined"
                            />
                            <Chip
                                icon={<People fontSize="small" />}
                                label={`${miembros.length} miembros`}
                                size="small"
                                variant="outlined"
                            />
                            {soyAdmin && (
                                <Chip
                                    icon={<AdminPanelSettings fontSize="small" />}
                                    label="Eres administrador"
                                    size="small"
                                    color="primary"
                                />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Panel de miembros */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Miembros</Typography>
            </Box>

            {soyAdmin && (
                <TextField
                    size="small"
                    placeholder="Buscar miembro por nombre o ID..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    sx={{ mb: 2, width: 300 }}
                />
            )}

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Usuario ID</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Se unió</TableCell>
                        <TableCell>Estado</TableCell>
                        {soyAdmin && <TableCell align="right">Acciones</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {miembrosFiltrados.map((miembro) => (
                        <TableRow key={miembro.id}>
                            <TableCell>{miembro.usuarioId}</TableCell>
                            <TableCell>
                                <Chip
                                    label={miembro.rol === "ADMIN" ? "Admin" : "Miembro"}
                                    size="small"
                                    color={miembro.rol === "ADMIN" ? "primary" : "default"}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell>
                                {new Date(miembro.unidoEn).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {miembro.bloqueadoEn ? (
                                    <Chip label="Bloqueado" size="small" color="error" />
                                ) : (
                                    <Chip label="Activo" size="small" color="success" variant="outlined" />
                                )}
                            </TableCell>
                            {soyAdmin && (
                                <TableCell align="right">
                                    {miembro.usuarioId !== user?.id && (
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            {miembro.rol !== "ADMIN" && (
                                                <Tooltip title="Promover a admin">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handlePromover(miembro)}
                                                    >
                                                        <AdminPanelSettings fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Remover del grupo">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => handleRemover(miembro)}
                                                >
                                                    <PersonRemove fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Bloquear">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleBloquear(miembro)}
                                                >
                                                    <Block fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Log de cambios */}
            {soyAdmin && log.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <History color="action" />
                        <Typography variant="h6">Historial de cambios</Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Acción</TableCell>
                                    <TableCell>Usuario afectado</TableCell>
                                    <TableCell>Realizado por</TableCell>
                                    <TableCell>Hora</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {log.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{entry.accion}</TableCell>
                                        <TableCell>{entry.usuario}</TableCell>
                                        <TableCell>{entry.realizadoPor}</TableCell>
                                        <TableCell>{entry.fecha}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
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

export default DetalleGrupo;