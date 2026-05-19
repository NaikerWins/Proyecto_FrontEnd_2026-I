import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { Paradero } from "../../models/Paradero";
import { paraderoService } from "../../services/paraderoService";
import Swal from "sweetalert2";

const UpdateParadero: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [paradero, setParadero] = useState<Paradero | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchParadero(Number(id));
    }, [id]);

    const fetchParadero = async (paraderoId: number) => {
        try {
            const data = await paraderoService.getParaderoById(paraderoId);
            if (data) {
                setParadero(data);
            } else {
                Swal.fire({ title: "Error", text: "Paradero no encontrado", icon: "error" });
                navigate("/paraderos");
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al cargar el paradero", icon: "error" });
            navigate("/paraderos");
        } finally {
            setLoading(false);
        }
    };

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
        { name: "activo", label: "Activo", type: "boolean" },
    ];

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            if (paradero?.id) {
                const updated = await paraderoService.updateParadero(paradero.id, {
                    ...values,
                    latitud: Number(values.latitud),
                    longitud: Number(values.longitud),
                });
                if (updated) {
                    Swal.fire({ title: "Éxito", text: "Paradero actualizado correctamente", icon: "success", timer: 3000 });
                    navigate("/paraderos");
                } else {
                    Swal.fire({ title: "Error", text: "Error al actualizar el paradero", icon: "error" });
                }
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al actualizar el paradero", icon: "error" });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (!paradero) return <Typography>Paradero no encontrado</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Actualizar Paradero
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Paradero"
                    fields={paraderoFields}
                    initialValues={paradero}
                    onSubmit={handleSubmit}
                    submitLabel="Actualizar Paradero"
                    onCancel={() => navigate("/paraderos")}
                />
            </Box>
        </Container>
    );
};

export default UpdateParadero;