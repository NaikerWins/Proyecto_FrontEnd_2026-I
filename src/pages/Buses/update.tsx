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
    const [fotoPreview, setFotoPreview] = useState<string>("");

    useEffect(() => {
        if (id) fetchBus(Number(id));
    }, [id]);

    const fetchBus = async (busId: number) => {
        try {
            const data = await busService.getBusById(busId);
            if (data) {
                setBus(data);
                // Si ya tiene foto, mostrarla como preview
                if (data.fotoBus) {
                    setFotoPreview(data.fotoBus);
                }
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
    ];

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            if (bus?.id) {
                const updated = await busService.updateBus(bus.id, {
                    modelo: values.modelo,
                    anio: Number(values.anio),
                    capacidadSentados: Number(values.capacidadSentados),
                    capacidadParados: Number(values.capacidadParados),
                    estado: values.estado,
                    fotoBus: fotoPreview || undefined,
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
                Actualizar Bus — {bus.placa}
            </Typography>
            <Box sx={{ mt: 3 }}>

                {/* Sección de foto */}
                <Box sx={{ mb: 3, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Foto del Bus
                    </Typography>

                    {/* Preview de foto actual o nueva */}
                    {fotoPreview && (
                        <Box
                            component="img"
                            src={fotoPreview}
                            alt={`Bus ${bus.placa}`}
                            sx={{
                                width: "100%",
                                maxHeight: 250,
                                objectFit: "cover",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0",
                                mb: 2,
                            }}
                        />
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {fotoPreview ? "Cambiar foto:" : "Agregar foto:"}
                    </Typography>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                    />

                    {fotoPreview && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ cursor: "pointer", display: "block", mt: 1 }}
                            onClick={() => setFotoPreview("")}
                        >
                            Quitar foto
                        </Typography>
                    )}
                </Box>

                <GenericForm
                    title="Información del Bus"
                    fields={busFields}
                    initialValues={{
                        modelo: bus.modelo,
                        anio: bus.anio,
                        capacidadSentados: bus.capacidadSentados,
                        capacidadParados: bus.capacidadParados,
                        estado: bus.estado,
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Actualizar Bus"
                    onCancel={() => navigate("/buses")}
                />
            </Box>
        </Container>
    );
};

export default UpdateBus;