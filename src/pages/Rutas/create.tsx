import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Box, Card, CardContent,
    Button, TextField, IconButton, Divider, Grid
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { rutaService } from "../../services/rutaService";
import { paraderoService } from "../../services/paraderoService";
import { Paradero } from "../../models/Paradero";
import Swal from "sweetalert2";

interface NodoForm {
    paraderoId: string;
    orden: string;
    distanciaDesdeAnterior: string;
    tiempoEstimado: string;
}

const CreateRuta: React.FC = () => {
    const navigate = useNavigate();
    const [paraderos, setParaderos] = useState<{ value: any; label: string }[]>([]);
    const [nodos, setNodos] = useState<NodoForm[]>([
        { paraderoId: "", orden: "1", distanciaDesdeAnterior: "", tiempoEstimado: "" },
        { paraderoId: "", orden: "2", distanciaDesdeAnterior: "", tiempoEstimado: "" },
        { paraderoId: "", orden: "3", distanciaDesdeAnterior: "", tiempoEstimado: "" },
    ]);

    useEffect(() => {
        const fetchParaderos = async () => {
            try {
                const data = await paraderoService.getParaderos();
                setParaderos(
                    data.map((p: Paradero) => ({
                        value: p.id,
                        label: `${p.nombre} - ${p.clasificacion}`,
                    }))
                );
            } catch (error) {
                console.error("Error al cargar paraderos:", error);
            }
        };
        fetchParaderos();
    }, []);

    const rutaFields: FormField[] = [
        { name: "nombre", label: "Nombre de la ruta", type: "text", required: true },
        { name: "descripcion", label: "Descripción", type: "text", multiline: true, rows: 3 },
        { name: "tarifa", label: "Tarifa ($)", type: "number", required: true },
    ];

    const initialValues = {
        nombre: "",
        descripcion: "",
        tarifa: "",
    };

    const handleAddNodo = () => {
        setNodos([
            ...nodos,
            {
                paraderoId: "",
                orden: String(nodos.length + 1),
                distanciaDesdeAnterior: "",
                tiempoEstimado: "",
            },
        ]);
    };

    const handleRemoveNodo = (index: number) => {
        if (nodos.length <= 3) {
            Swal.fire({
                title: "Mínimo 3 paraderos",
                text: "La ruta debe tener al menos 3 paraderos",
                icon: "warning",
            });
            return;
        }
        const nuevosNodos = nodos
            .filter((_, i) => i !== index)
            .map((n, i) => ({ ...n, orden: String(i + 1) }));
        setNodos(nuevosNodos);
    };

    const handleNodoChange = (index: number, field: keyof NodoForm, value: string) => {
        const nuevosNodos = [...nodos];
        nuevosNodos[index] = { ...nuevosNodos[index], [field]: value };
        setNodos(nuevosNodos);
    };

    const handleSubmit = async (values: Record<string, any>) => {
        // Validar que todos los nodos tengan paradero
        const nodosIncompletos = nodos.some((n) => !n.paraderoId);
        if (nodosIncompletos) {
            Swal.fire({ title: "Error", text: "Todos los paraderos son obligatorios", icon: "error" });
            return;
        }

        // Validar paraderos duplicados
        const paraderoIds = nodos.map((n) => n.paraderoId);
        const paraderoIdsUnicos = new Set(paraderoIds);
        if (paraderoIds.length !== paraderoIdsUnicos.size) {
            Swal.fire({ title: "Error", text: "No puede haber paraderos duplicados", icon: "error" });
            return;
        }

        try {
            const ruta = await rutaService.createRuta({
                nombre: values.nombre,
                descripcion: values.descripcion || undefined,
                tarifa: Number(values.tarifa),
                nodos: nodos.map((n) => ({
                    paraderoId: Number(n.paraderoId),
                    orden: Number(n.orden),
                    distanciaDesdeAnterior: n.distanciaDesdeAnterior
                        ? Number(n.distanciaDesdeAnterior)
                        : undefined,
                    tiempoEstimado: n.tiempoEstimado
                        ? Number(n.tiempoEstimado)
                        : undefined,
                })),
            });

            if (ruta) {
                Swal.fire({ title: "Éxito", text: "Ruta creada correctamente", icon: "success", timer: 3000 });
                navigate("/rutas");
            } else {
                Swal.fire({ title: "Error", text: "Error al crear la ruta", icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al crear la ruta", icon: "error" });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Crear Nueva Ruta
            </Typography>
            <Box sx={{ mt: 3 }}>
                {/* Info básica de la ruta */}
                <GenericForm
                    title="Información de la Ruta"
                    fields={rutaFields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Crear Ruta"
                    onCancel={() => navigate("/rutas")}
                />

                {/* Nodos / Paraderos */}
                <Card elevation={3} sx={{ mt: 3 }}>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6">
                                Paraderos de la ruta (mínimo 3)
                            </Typography>
                            <Button
                                startIcon={<Add />}
                                variant="outlined"
                                onClick={handleAddNodo}
                                size="small"
                            >
                                Agregar paradero
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {nodos.map((nodo, index) => (
                            <Box key={index} sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle2" color="primary">
                                        Paradero #{nodo.orden}
                                    </Typography>
                                    {nodos.length > 3 && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveNodo(index)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Paradero"
                                            value={nodo.paraderoId}
                                            onChange={(e) => handleNodoChange(index, "paraderoId", e.target.value)}
                                            size="small"
                                            required
                                            SelectProps={{ native: true }}
                                        >
                                            <option value="">Seleccione un paradero</option>
                                            {paraderos.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Distancia desde anterior (km)"
                                            type="number"
                                            value={nodo.distanciaDesdeAnterior}
                                            onChange={(e) => handleNodoChange(index, "distanciaDesdeAnterior", e.target.value)}
                                            size="small"
                                            disabled={index === 0}
                                            helperText={index === 0 ? "Primer paradero" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Tiempo estimado (min)"
                                            type="number"
                                            value={nodo.tiempoEstimado}
                                            onChange={(e) => handleNodoChange(index, "tiempoEstimado", e.target.value)}
                                            size="small"
                                            disabled={index === 0}
                                            helperText={index === 0 ? "Primer paradero" : ""}
                                        />
                                    </Grid>
                                </Grid>

                                {index < nodos.length - 1 && (
                                    <Divider sx={{ mt: 2 }} />
                                )}
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default CreateRuta;