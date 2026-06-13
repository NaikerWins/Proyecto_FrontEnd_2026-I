import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { turnoService } from "../../services/turnoService";
import { busService } from "../../services/busService";
import { Bus } from "../../models/Bus";
import apiNest from "../../interceptors/axiosNestInterceptor";
import Swal from "sweetalert2";

const CreateTurno: React.FC = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState<{ value: any; label: string }[]>([]);
    const [conductores, setConductores] = useState<{ value: any; label: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [busesData, conductoresData] = await Promise.all([
                    busService.getBuses(),
                    apiNest.get("/conductores"),
                ]);

                setBuses(
                    busesData
                        .filter((b: Bus) => b.estado === "operativo")
                        .map((b: Bus) => ({
                            value: b.id,
                            label: `${b.placa} - ${b.modelo}`,
                        }))
                );

                setConductores(
                    conductoresData.data.map((c: any) => ({
                        value: c.id,
                        label: `${c.persona.nombre} ${c.persona.apellido} - ${c.licencia}`,
                    }))
                );
            } catch (error) {
                console.error("Error al cargar datos:", error);
            }
        };
        fetchData();
    }, []);

    const turnoFields: FormField[] = [
        { name: "conductorId", label: "Conductor", type: "select", options: conductores, required: true },
        { name: "busId", label: "Bus", type: "select", options: buses, required: true },
        { name: "fechaProgramada", label: "Fecha y hora programada", type: "datetime-local" as any, required: true },
        { name: "observaciones", label: "Observaciones", type: "text", multiline: true, rows: 3 },
    ];

    const initialValues = {
        conductorId: "",
        busId: "",
        fechaProgramada: "",
        observaciones: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const turno = await turnoService.createTurno({
                conductorId: Number(values.conductorId),
                busId: Number(values.busId),
                fechaProgramada: values.fechaProgramada || undefined,
                observaciones: values.observaciones || undefined,
            });
            if (turno) {
                Swal.fire({ title: "Éxito", text: "Turno programado correctamente", icon: "success", timer: 3000 });
                navigate("/turnos");
            } else {
                Swal.fire({ title: "Error", text: "Error al programar el turno", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al programar el turno", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Programar Turno
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Turno"
                    fields={turnoFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Programar Turno"
                    onCancel={() => navigate("/turnos")}
                />
            </Box>
        </Container>
    );
};

export default CreateTurno;