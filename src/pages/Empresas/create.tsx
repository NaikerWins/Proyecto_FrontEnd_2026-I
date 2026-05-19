import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { empresaService } from "../../services/empresaService";
import Swal from "sweetalert2";

const CreateEmpresa: React.FC = () => {
    const navigate = useNavigate();

    const empresaFields: FormField[] = [
        { name: "nombre", label: "Nombre de la empresa", type: "text", required: true },
        { name: "nit", label: "NIT", type: "text", required: true },
        { name: "telefono", label: "Teléfono", type: "text" },
        { name: "email", label: "Email", type: "email" },
    ];

    const initialValues = {
        nombre: "",
        nit: "",
        telefono: "",
        email: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const empresa = await empresaService.createEmpresa({
                nombre: values.nombre,
                nit: values.nit,
                telefono: values.telefono || undefined,
                email: values.email || undefined,
            });
            if (empresa) {
                Swal.fire({ title: "Éxito", text: "Empresa creada correctamente", icon: "success", timer: 3000 });
                navigate("/empresas");
            } else {
                Swal.fire({ title: "Error", text: "Error al crear la empresa", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al crear la empresa", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Crear Nueva Empresa
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información de la Empresa"
                    fields={empresaFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Crear Empresa"
                    onCancel={() => navigate("/empresas")}
                />
            </Box>
        </Container>
    );
};

export default CreateEmpresa;