import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { Empresa } from "../../models/Empresa";
import { empresaService } from "../../services/empresaService";
import Swal from "sweetalert2";

const UpdateEmpresa: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchEmpresa(Number(id));
    }, [id]);

    const fetchEmpresa = async (empresaId: number) => {
        try {
            const data = await empresaService.getEmpresaById(empresaId);
            if (data) {
                setEmpresa(data);
            } else {
                Swal.fire({ title: "Error", text: "Empresa no encontrada", icon: "error" });
                navigate("/empresas");
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al cargar la empresa", icon: "error" });
            navigate("/empresas");
        } finally {
            setLoading(false);
        }
    };

    const empresaFields: FormField[] = [
        { name: "nombre", label: "Nombre de la empresa", type: "text", required: true },
        { name: "telefono", label: "Teléfono", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "activa", label: "Activa", type: "boolean" },
    ];

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            if (empresa?.id) {
                const updated = await empresaService.updateEmpresa(empresa.id, {
                    nombre: values.nombre,
                    telefono: values.telefono || undefined,
                    email: values.email || undefined,
                    activa: values.activa,
                });
                if (updated) {
                    Swal.fire({ title: "Éxito", text: "Empresa actualizada correctamente", icon: "success", timer: 3000 });
                    navigate("/empresas");
                } else {
                    Swal.fire({ title: "Error", text: "Error al actualizar la empresa", icon: "error" });
                }
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al actualizar la empresa", icon: "error" });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!empresa) return <Typography>Empresa no encontrada</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Actualizar Empresa
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información de la Empresa"
                    fields={empresaFields}
                    initialValues={empresa}
                    onSubmit={handleSubmit}
                    submitLabel="Actualizar Empresa"
                    onCancel={() => navigate("/empresas")}
                />
            </Box>
        </Container>
    );
};

export default UpdateEmpresa;