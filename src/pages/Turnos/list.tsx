import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Container, Typography,
    Alert, Snackbar
} from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Turno } from "../../models/Turno";
import { turnoService } from "../../services/turnoService";
import Swal from "sweetalert2";

const ListTurnos: React.FC = () => {
    const navigate = useNavigate();
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchTurnos();
    }, []);

    const fetchTurnos = async () => {
        try {
            const data = await turnoService.getTurnos();
            setTurnos(data);
        } catch (error) {
            showSnackbar("Error al cargar turnos", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const turnosTabla = turnos.map((t) => ({
        ...t,
        conductorNombre: t.conductor
            ? `${t.conductor.persona.nombre} ${t.conductor.persona.apellido}`
            : "Sin conductor",
        busPlaca: t.bus?.placa || "Sin bus",
        fechaProgramada: t.fechaProgramada
            ? new Date(t.fechaProgramada).toLocaleString()
            : "-",
        fechaInicio: t.fechaInicio
            ? new Date(t.fechaInicio).toLocaleString()
            : "-",
        fechaFin: t.fechaFin
            ? new Date(t.fechaFin).toLocaleString()
            : "-",
    }));

    const handleAction = async (action: string, item: Record<string, any>) => {
        const turno = turnos.find((t) => t.id === item.id);
        if (!turno) return;

        if (action === "iniciar") {
            const { value: observaciones } = await Swal.fire({
                title: "Iniciar turno",
                text: "¿Desea agregar observaciones sobre el estado del bus?",
                input: "textarea",
                inputPlaceholder: "Observaciones (opcional)",
                showCancelButton: true,
                confirmButtonText: "Iniciar turno",
                cancelButtonText: "Cancelar",
            });

            if (observaciones !== undefined) {
                const iniciado = await turnoService.iniciarTurno(
                    turno.conductor?.id!,
                    observaciones || undefined
                );
                if (iniciado) {
                    showSnackbar("Turno iniciado correctamente", "success");
                    fetchTurnos();
                } else {
                    showSnackbar("Error al iniciar el turno", "error");
                }
            }
        } else if (action === "finalizar") {
            Swal.fire({
                title: "¿Finalizar turno?",
                text: "Se desactivará el GPS del bus automáticamente",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, finalizar",
                cancelButtonText: "Cancelar",
            }).then(async (result) => {
                if (result.isConfirmed && turno.conductor?.id) {
                    const finalizado = await turnoService.finalizarTurno(turno.conductor.id);
                    if (finalizado) {
                        showSnackbar("Turno finalizado correctamente", "success");
                        fetchTurnos();
                    } else {
                        showSnackbar("Error al finalizar el turno", "error");
                    }
                }
            });
        }
    };

    
    /*
    // Acciones dinámicas según estado del turno
    const getAcciones = (turno: any) => {
        if (turno.estado === "programado") {
            return [{ name: "iniciar", label: "Iniciar", color: "success" as any }];
        } else if (turno.estado === "en_curso") {
            return [{ name: "finalizar", label: "Finalizar", color: "error" as any }];
        }
        return [];
    };
    */

    // Todas las acciones posibles para GenericTable
    const todasLasAcciones = [
        { name: "iniciar", label: "Iniciar", color: "success" as any },
        { name: "finalizar", label: "Finalizar", color: "error" as any },
    ];

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Turnos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/turnos/crear")}
                >
                    Programar Turno
                </Button>
            </Box>

            <GenericTable
                data={turnosTabla}
                columns={[
                    "id",
                    "conductorNombre",
                    "busPlaca",
                    "estado",
                    "fechaProgramada",
                    "fechaInicio",
                    "fechaFin",
                    "observaciones",
                ]}
                columnNames={{
                    id: "ID",
                    conductorNombre: "Conductor",
                    busPlaca: "Bus",
                    estado: "Estado",
                    fechaProgramada: "Fecha Programada",
                    fechaInicio: "Inicio Real",
                    fechaFin: "Fin",
                    observaciones: "Observaciones",
                }}
                actions={todasLasAcciones}
                onAction={handleAction}
                title="Lista de Turnos"
            />

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

export default ListTurnos;