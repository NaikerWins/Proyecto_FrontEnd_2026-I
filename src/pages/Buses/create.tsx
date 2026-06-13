import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { busService } from "../../services/busService";
import { Empresa } from "../../models/Empresa";
//import apiNest from "../../interceptors/axiosNestInterceptor";
import Swal from "sweetalert2";
import api from "../../interceptors/busesInterceptor";

const CreateBus: React.FC = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<{ value: any; label: string }[]>([]);
    const [fotoPreview, setFotoPreview] = useState<string>("");
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await api.get<Empresa[]>("/empresas");
                setEmpresas(
                    response.data.map((e) => ({
                        value: e.id,
                        label: `${e.nombre} - ${e.nit}`,
                    }))
                );
            } catch (error) {
                console.error("Error al cargar empresas:", error);
            }
        };
        fetchEmpresas();
    }, []);

    const estadoOptions = [
        { label: "Operativo", value: "operativo" },
        { label: "Mantenimiento", value: "mantenimiento" },
        { label: "Fuera de servicio", value: "fuera_de_servicio" },
    ];

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const busFields: FormField[] = [
        { name: "placa", label: "Placa", type: "text", required: true },
        { name: "modelo", label: "Modelo", type: "text", required: true },
        { name: "anio", label: "Año", type: "number", required: true },
        { name: "capacidadSentados", label: "Capacidad sentados", type: "number", required: true },
        { name: "capacidadParados", label: "Capacidad parados", type: "number", required: true },
        { name: "estado", label: "Estado inicial", type: "select", options: estadoOptions, required: true },
        { name: "empresaId", label: "Empresa", type: "select", options: empresas, required: true },
    ];

    const initialValues = {
        placa: "",
        modelo: "",
        anio: "",
        capacidadSentados: "",
        capacidadParados: "",
        estado: "",
        empresaId: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const { empresaId, ...datosBus } = values;
            const fotoBus = fotoPreview || undefined;

            const bus = await busService.createBus(
                {
                    placa: datosBus.placa,
                    modelo: datosBus.modelo,
                    anio: Number(datosBus.anio),
                    capacidadSentados: Number(datosBus.capacidadSentados),
                    capacidadParados: Number(datosBus.capacidadParados),
                    estado: datosBus.estado,
                    fotoBus,
                },
                Number(empresaId)
            );

            if (bus) {
                Swal.fire({ title: "Éxito", text: "Bus registrado correctamente", icon: "success", timer: 3000 });
                navigate("/buses");
            } else {
                Swal.fire({ title: "Error", text: "Error al registrar el bus", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al registrar el bus", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Registrar Nuevo Bus
            </Typography>
            <Box sx={{ mt: 3 }}>

                {/* Sección de foto */}
                <Box sx={{ mb: 3, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Foto del Bus
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        style={{ marginBottom: 8 }}
                    />
                    {fotoPreview && (
                        <Box
                            component="img"
                            src={fotoPreview}
                            alt="Preview del bus"
                            sx={{
                                mt: 1,
                                width: "100%",
                                maxHeight: 200,
                                objectFit: "cover",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0",
                            }}
                        />
                    )}
                </Box>

                <GenericForm
                    title="Información del Bus"
                    fields={busFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Registrar Bus"
                    onCancel={() => navigate("/buses")}
                />
            </Box>
        </Container>
    );
};

export default CreateBus;