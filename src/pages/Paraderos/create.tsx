import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { paraderoService } from "../../services/paraderoService";
import Swal from "sweetalert2";

const CreateParadero: React.FC = () => {
    const navigate = useNavigate();

    const clasificacionOptions = [
        { label: "Principal", value: "principal" },
        { label: "Secundario", value: "secundario" },
        { label: "Terminal", value: "terminal" },
    ];

    const paraderoFields: FormField[] = [
        { name: "nombre", label: "Nombre", type: "text", required: true },
        { name: "latitud", label: "Latitud", type: "number", required: true },
        { name: "longitud", label: "Longitud", type: "number", required: true },
        { name: "clasificacion", label: "Clasificación", type: "select", options: clasificacionOptions, required: true },
    ];

    const initialValues = {
        nombre: "",
        latitud: "",
        longitud: "",
        clasificacion: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const paradero = await paraderoService.createParadero({
                nombre: values.nombre,
                latitud: Number(values.latitud),
                longitud: Number(values.longitud),
                clasificacion: values.clasificacion,
            });
            if (paradero) {
                Swal.fire({ title: "Éxito", text: "Paradero registrado correctamente", icon: "success", timer: 3000 });
                navigate("/paraderos");
            } else {
                Swal.fire({ title: "Error", text: "Error al registrar el paradero", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al registrar el paradero", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Registrar Nuevo Paradero
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Paradero"
                    fields={paraderoFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Registrar Paradero"
                    onCancel={() => navigate("/paraderos")}
                />
            </Box>
        </Container>
    );
};

export default CreateParadero;