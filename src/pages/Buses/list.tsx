import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Container, Typography, Alert, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Chip
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { Bus } from "../../models/Bus";
import { busService } from "../../services/busService";
import Swal from "sweetalert2";

const ListBuses: React.FC = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const data = await busService.getBuses();
            setBuses(data);
        } catch (error) {
            showSnackbar("Error al cargar buses", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const getEstadoColor = (estado: string): any => {
        const colores: Record<string, any> = {
            operativo: "success",
            mantenimiento: "warning",
            fuera_de_servicio: "error",
        };
        return colores[estado] || "default";
    };

    const handleEdit = (id: number) => {
        navigate(`/buses/editar/${id}`);
    };

    const handleIncidentes = (id: number) => {
        navigate(`/incidentes/bus/${id}`);
    };

    const handleDelete = (bus: Bus) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed && bus.id) {
                const success = await busService.deleteBus(bus.id);
                if (success) {
                    showSnackbar("Bus eliminado correctamente", "success");
                    fetchBuses();
                } else {
                    showSnackbar("Error al eliminar el bus", "error");
                }
            }
        });
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Buses
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/buses/crear")}
                >
                    Nuevo Bus
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "primary.main" }}>
                            {["ID", "Foto", "Placa", "Modelo", "Año", "Cap. Sentados", "Cap. Parados", "Estado", "Empresa", "GPS", "Código QR", "Acciones"].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{ color: "white", fontWeight: "bold", fontSize: "0.875rem" }}
                                >
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {buses.length > 0 ? (
                            buses.map((bus, index) => (
                                <TableRow
                                    key={bus.id}
                                    sx={{
                                        "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                                        "&:last-child td": { border: 0 },
                                    }}
                                >
                                    <TableCell>{bus.id}</TableCell>

                                    {/* Foto */}
                                    <TableCell>
                                        {bus.fotoBus ? (
                                            <Box
                                                component="img"
                                                src={bus.fotoBus}
                                                alt={`Bus ${bus.placa}`}
                                                sx={{
                                                    width: 80,
                                                    height: 60,
                                                    objectFit: "cover",
                                                    borderRadius: 1,
                                                    border: "1px solid #e0e0e0",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                    Swal.fire({
                                                        imageUrl: bus.fotoBus,
                                                        imageAlt: `Bus ${bus.placa}`,
                                                        title: bus.placa,
                                                        showConfirmButton: false,
                                                        showCloseButton: true,
                                                    });
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Sin foto
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>{bus.placa}</TableCell>
                                    <TableCell>{bus.modelo}</TableCell>
                                    <TableCell>{bus.anio}</TableCell>
                                    <TableCell>{bus.capacidadSentados}</TableCell>
                                    <TableCell>{bus.capacidadParados}</TableCell>

                                    {/* Estado */}
                                    <TableCell>
                                        <Chip
                                            label={bus.estado?.replace(/_/g, " ")}
                                            color={getEstadoColor(bus.estado || "")}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell>{bus.empresa?.nombre || "Sin empresa"}</TableCell>

                                    {/* GPS */}
                                    <TableCell>
                                        <Chip
                                            label={bus.gps?.activo ? "Activo" : "Inactivo"}
                                            color={bus.gps?.activo ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>

                                    {/* QR */}
                                    <TableCell>
                                        {bus.codigoQR ? (
                                            <Box
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: `QR - ${bus.placa}`,
                                                        html: `<div style="display:flex;justify-content:center;padding:16px">
                                                            <svg id="qr-${bus.id}"></svg>
                                                        </div>`,
                                                        showConfirmButton: false,
                                                        showCloseButton: true,
                                                        didOpen: () => {
                                                            const container = document.getElementById(`qr-${bus.id}`);
                                                            if (container) {
                                                                container.outerHTML = `<div id="qr-container-${bus.id}"></div>`;
                                                            }
                                                        }
                                                    });
                                                }}
                                            >
                                                <QRCodeSVG
                                                    value={bus.codigoQR}
                                                    size={60}
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Sin QR
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEdit(bus.id!)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="warning"
                                                onClick={() => handleIncidentes(bus.id!)}
                                            >
                                                Incidentes
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(bus)}
                                            >
                                                Eliminar
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay buses registrados
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

export default ListBuses;