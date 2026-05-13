import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { busService } from "../../services/busService";
import { Empresa } from "../../models/Empresa";
import apiNest from "../../interceptors/axiosNestInterceptor";
import Swal from "sweetalert2";

const CreateBus: React.FC = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<{ value: any; label: string }[]>([]);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await apiNest.get<Empresa[]>("/empresas");
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

    const busFields: FormField[] = [
        { name: "placa", label: "Placa", type: "text", required: true },
        { name: "modelo", label: "Modelo", type: "text", required: true },
        { name: "anio", label: "Año", type: "number", required: true },
        { name: "capacidadSentados", label: "Capacidad sentados", type: "number", required: true },
        { name: "capacidadParados", label: "Capacidad parados", type: "number", required: true },
        { name: "estado", label: "Estado inicial", type: "select", options: estadoOptions, required: true },
        { name: "fotoBus", label: "URL de foto del bus", type: "text" },
        { name: "empresaId", label: "Empresa", type: "select", options: empresas, required: true },
    ];

    const initialValues = {
        placa: "",
        modelo: "",
        anio: "",
        capacidadSentados: "",
        capacidadParados: "",
        estado: "",
        fotoBus: "",
        empresaId: "",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            const { empresaId, ...datosBus } = values;
            const bus = await busService.createBus(
                {
                    ...datosBus,
                    anio: Number(datosBus.anio),
                    capacidadSentados: Number(datosBus.capacidadSentados),
                    capacidadParados: Number(datosBus.capacidadParados),
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