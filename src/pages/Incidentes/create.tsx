import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, Box, Button, TextField, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { incidenteService } from "../../services/incidenteService";
import { busService } from "../../services/busService";
import { Bus } from "../../models/Bus";
import Swal from "sweetalert2";
import { conductorService } from "../../services/conductorService";

const CreateIncidente: React.FC = () => {
    const navigate = useNavigate();
    const { busId } = useParams<{ busId: string }>();
    const [buses, setBuses] = useState<{ value: any; label: string }[]>([]);
    const [fotos, setFotos] = useState<string[]>([""]);
    const [conductores, setConductores] = useState<{ value: any; label: string }[]>([]);

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const data = await busService.getBuses();
                setBuses(
                    data.map((b: Bus) => ({
                        value: b.id,
                        label: `${b.placa} - ${b.modelo}`,
                    }))
                );
            } catch (error) {
                console.error("Error al cargar buses:", error);
            }
        };
        fetchBuses();
    }, []);

    useEffect(() => {
        const fetchConductores = async () => {
            try {
                const data = await conductorService.getConductores();
                setConductores(
                    data.map((c: any) => ({
                        value: c.id ?? "",
                        label: `${c.persona?.nombre ?? ""} ${c.persona?.apellido ?? ""}`.trim() || `Conductor ${c.id}`,
                    }))
                );
            } catch (error) {
                console.error("Error al cargar conductores:", error);
            }
        };
        fetchConductores();
    }, []);

    const tipoOptions = [
        { label: "Accidente menor", value: "accidente_menor" },
        { label: "Falla mecánica", value: "falla_mecanica" },
        { label: "Congestión inesperada", value: "congestion_inesperada" },
        { label: "Problema con pasajeros", value: "problema_pasajeros" },
    ];

    const gravedadOptions = [
        { label: "Bajo", value: "bajo" },
        { label: "Medio", value: "medio" },
        { label: "Alto", value: "alto" },
        { label: "Crítico", value: "critico" },
    ];

    const incidenteFields: FormField[] = [
        { name: "busId", label: "Bus", type: "select", options: buses, required: true },
        { name: "conductor_id", label: "Conductor", type: "select", options: conductores, required: true },
        { name: "tipo", label: "Tipo de incidente", type: "select", options: tipoOptions, required: true },
        { name: "gravedad", label: "Gravedad", type: "select", options: gravedadOptions, required: true },
        { name: "descripcion", label: "Descripción", type: "text", required: true, multiline: true, rows: 4 },
    ];

    const initialValues = {
        busId: busId || "",
        conductor_id: "",
        tipo: "",
        gravedad: "",
        descripcion: "",
    };

    const handleAddFoto = () => {
        if (fotos.length < 5) {
            setFotos([...fotos, ""]);
        }
    };

    const handleFotoChange = (index: number, value: string) => {
        const nuevasFotos = [...fotos];
        nuevasFotos[index] = value;
        setFotos(nuevasFotos);
    };

    const handleRemoveFoto = (index: number) => {
        setFotos(fotos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const fotosValidas = fotos
                .filter((url) => url.trim() !== "")
                .map((url) => ({ url }));

            const incidente = await incidenteService.createIncidente({
    tipo: values.tipo,
    gravedad: values.gravedad,
    descripcion: values.descripcion,
    busId: Number(values.busId),
conductorId: Number(values.conductor_id || values.conductorId),
    fotos: fotosValidas,
});

            if (incidente) {
                Swal.fire({
                    title: "Éxito",
                    text: "Incidente reportado correctamente",
                    icon: "success",
                    timer: 3000,
                });
                navigate(`/incidentes/bus/${values.busId}`);
            } else {
                Swal.fire({ title: "Error", text: "Error al reportar el incidente", icon: "error" });
            }
        } catch (error: any) {
  const mensaje = error.response?.data?.message
    ? (Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ') 
        : error.response.data.message)
    : 'Error al reportar el incidente';
  Swal.fire({ title: "Error", text: mensaje, icon: "error" });
}
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Reportar Incidente
            </Typography>
            <Box sx={{ mt: 3 }}>
                <GenericForm
                    title="Información del Incidente"
                    fields={incidenteFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Reportar Incidente"
                    onCancel={() => navigate(-1)}
                />

                {/* Sección de fotos aparte porque GenericForm no soporta listas dinámicas */}
                <Box sx={{ mt: 3, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Fotografías como evidencia (máx. 5)
                    </Typography>
                    {fotos.map((foto, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                label={`URL Foto ${index + 1}`}
                                value={foto}
                                onChange={(e) => handleFotoChange(index, e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            {fotos.length > 1 && (
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveFoto(index)}
                                >
                                    <Delete />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    {fotos.length < 5 && (
                        <Button
                            startIcon={<Add />}
                            variant="outlined"
                            onClick={handleAddFoto}
                            size="small"
                        >
                            Agregar foto
                        </Button>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default CreateIncidente;