import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { Conductor } from "../../models/Conductor";
import { conductorService } from "../../services/conductorService";
import Swal from "sweetalert2";

const UpdateConductor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [conductor, setConductor] = useState<Conductor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchConductor(Number(id));
    }, [id]);

    const fetchConductor = async (conductorId: number) => {
        try {
            const data = await conductorService.getConductorById(conductorId);
            if (data) {
                setConductor(data);
            } else {
                Swal.fire({ title: "Error", text: "Conductor no encontrado", icon: "error" });
                navigate("/conductores");
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al cargar el conductor", icon: "error" });
            navigate("/conductores");
        } finally {
            setLoading(false);
        }
    };

    const conductorFields: FormField[] = [
        { name: "licencia", label: "Número de licencia", type: "text", required: true },
        { name: "nombre", label: "Nombre", type: "text", required: true },
        { name: "apellido", label: "Apellido", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "telefono", label: "Teléfono", type: "text" },
    ];

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            if (conductor?.id) {
                const updated = await conductorService.updateConductor(conductor.id, {
                    licencia: values.licencia,
                    persona: {
                        nombre: values.nombre,
                        apellido: values.apellido,
                        email: values.email,
                        telefono: values.telefono || undefined,
                    },
                });
                if (updated) {
                    Swal.fire({ title: "Éxito", text: "Conductor actualizado correctamente", icon: "success", timer: 3000 });
                    navigate("/conductores");
                } else {
                    Swal.fire({ title: "Error", text: "Error al actualizar el conductor", icon: "error" });
                }
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al actualizar el conductor", icon: "error" });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!conductor) return <Typography>Conductor no encontrado</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Actualizar Conductor
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Conductor"
                    fields={conductorFields}
                    initialValues={{
                        licencia: conductor.licencia,
                        nombre: conductor.persona.nombre,
                        apellido: conductor.persona.apellido,
                        email: conductor.persona.email,
                        telefono: conductor.persona.telefono || "",
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Actualizar Conductor"
                    onCancel={() => navigate("/conductores")}
                />
            </Box>
        </Container>
    );
};

export default UpdateConductor;