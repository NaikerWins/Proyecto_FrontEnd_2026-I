import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { Bus } from "../../models/Bus";
import { busService } from "../../services/busService";
import Swal from "sweetalert2";

const UpdateBus: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [bus, setBus] = useState<Bus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBus(Number(id));
    }, [id]);

    const fetchBus = async (busId: number) => {
        try {
            const data = await busService.getBusById(busId);
            if (data) {
                setBus(data);
            } else {
                Swal.fire({ title: "Error", text: "Bus no encontrado", icon: "error" });
                navigate("/buses");
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al cargar el bus", icon: "error" });
            navigate("/buses");
        } finally {
            setLoading(false);
        }
    };

    const estadoOptions = [
        { label: "Operativo", value: "operativo" },
        { label: "Mantenimiento", value: "mantenimiento" },
        { label: "Fuera de servicio", value: "fuera_de_servicio" },
    ];

    const busFields: FormField[] = [
        { name: "modelo", label: "Modelo", type: "text", required: true },
        { name: "anio", label: "Año", type: "number", required: true },
        { name: "capacidadSentados", label: "Capacidad sentados", type: "number", required: true },
        { name: "capacidadParados", label: "Capacidad parados", type: "number", required: true },
        { name: "estado", label: "Estado", type: "select", options: estadoOptions, required: true },
        { name: "fotoBus", label: "URL de foto del bus", type: "text" },
    ];

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            if (bus?.id) {
                const updated = await busService.updateBus(bus.id, {
                    ...values,
                    anio: Number(values.anio),
                    capacidadSentados: Number(values.capacidadSentados),
                    capacidadParados: Number(values.capacidadParados),
                });
                if (updated) {
                    Swal.fire({ title: "Éxito", text: "Bus actualizado correctamente", icon: "success", timer: 3000 });
                    navigate("/buses");
                } else {
                    Swal.fire({ title: "Error", text: "Error al actualizar el bus", icon: "error" });
                }
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al actualizar el bus", icon: "error" });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!bus) return <Typography>Bus no encontrado</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Actualizar Bus
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Bus"
                    fields={busFields}
                    initialValues={bus}
                    onSubmit={handleSubmit}
                    submitLabel="Actualizar Bus"
                    onCancel={() => navigate("/buses")}
                />
            </Box>
        </Container>
    );
};

export default UpdateBus;