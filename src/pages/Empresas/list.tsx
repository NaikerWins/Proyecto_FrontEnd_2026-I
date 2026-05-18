import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, Alert, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import GenericTable from "../../components/Generics/MUI/GenericList";
import { Empresa } from "../../models/Empresa";
import { empresaService } from "../../services/empresaService";
import Swal from "sweetalert2";

const ListEmpresas: React.FC = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as any,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const data = await empresaService.getEmpresas();
            setEmpresas(data);
        } catch (error) {
            showSnackbar("Error al cargar empresas", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAction = async (action: string, item: Record<string, any>) => {
        const empresa = empresas.find((e) => e.id === item.id);
        if (!empresa) return;

        if (action === "edit") {
            navigate(`/empresas/editar/${empresa.id}`);
        } else if (action === "delete") {
            Swal.fire({
                title: "¿Desactivar empresa?",
                text: "La empresa quedará inactiva",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, desactivar",
                cancelButtonText: "Cancelar",
            }).then(async (result) => {
                if (result.isConfirmed && empresa.id) {
                    const success = await empresaService.deleteEmpresa(empresa.id);
                    if (success) {
                        showSnackbar("Empresa desactivada correctamente", "success");
                        fetchEmpresas();
                    } else {
                        showSnackbar("Error al desactivar la empresa", "error");
                    }
                }
            });
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Empresas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/empresas/crear")}
                >
                    Nueva Empresa
                </Button>
            </Box>

            <GenericTable
                data={empresas}
                columns={["id", "nombre", "nit", "telefono", "email", "activa"]}
                columnNames={{
                    id: "ID",
                    nombre: "Nombre",
                    nit: "NIT",
                    telefono: "Teléfono",
                    email: "Email",
                    activa: "Activa",
                }}
                actions={[
                    { name: "edit", label: "Editar", color: "primary" },
                    { name: "delete", label: "Desactivar", color: "error" },
                ]}
                onAction={handleAction}
                title="Lista de Empresas"
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ListEmpresas;