import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { conductorService } from "../../services/conductorService";
import Swal from "sweetalert2";

const CreateConductor: React.FC = () => {
    const navigate = useNavigate();

    const conductorFields: FormField[] = [
        { name: "licencia", label: "Número de licencia", type: "text", required: true },
        { name: "nombre", label: "Nombre", type: "text", required: true },
        { name: "apellido", label: "Apellido", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "telefono", label: "Teléfono", type: "text" },
    ];

    const initialValues = {
        licencia: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const conductor = await conductorService.createConductor({
                licencia: values.licencia,
                persona: {
                    nombre: values.nombre,
                    apellido: values.apellido,
                    email: values.email,
                    telefono: values.telefono || undefined,
                },
            });
            if (conductor) {
                Swal.fire({ title: "Éxito", text: "Conductor registrado correctamente", icon: "success", timer: 3000 });
                navigate("/conductores");
            } else {
                Swal.fire({ title: "Error", text: "Error al registrar el conductor", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al registrar el conductor", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Registrar Nuevo Conductor
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Conductor"
                    fields={conductorFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Registrar Conductor"
                    onCancel={() => navigate("/conductores")}
                />
            </Box>
        </Container>
    );
};

export default CreateConductor;