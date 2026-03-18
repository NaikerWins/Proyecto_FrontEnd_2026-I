import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import GenericForm, { FormField } from "../../components/Generics/MUI/GenericForm";
import { Role } from "../../models/Role";
import { roleService } from "../../services/roleService";
import Swal from "sweetalert2";


const CreateRole: React.FC = () => {
  const navigate = useNavigate();

const [isCustomRole, setIsCustomRole] = useState(false);

  const tipoRol=[
    {label:"Administrador Sistema", value:"Administrador Sistema"},
    {label: "Administrador Empresa", value: "Administrador Empresa"},
    {label: "Supervisor", value: "Supervisor"},
    {label: "Conductor", value: "Conductor"},
    {label: "Ciudadano", value: "Ciudadano"},
    { label: "Personalizado...", value: "Personalizado..." }  

  ]
  const roleFields: FormField[]= [
    { name: "name", label: "Tipo de Rol", type: "select", options: tipoRol, required: true },
        ...(isCustomRole ? [{ name: "customName", label: "Nombre personalizado", type: "text" as const, required: true }] : []),
    { name: "description", label: "Descripción", type: "text", multiline: true, rows: 3 },
    { name: "isActive", label: "Activo", type: "boolean" },
  ];

  const initialValues: Partial<Role> = {
    name: "",
    description: "",
    isActive: true,
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const finalValues = {
        ...values,
        name: values.name === "Personalizado..." ? values.customName : values.name
    };
    try {
        const role = await roleService.createRole(finalValues as Role);
        if (role) {
            Swal.fire({ title: "Éxito", text: "Rol creado correctamente", icon: "success", timer: 3000 });
            navigate("/roles");
        } else {
            Swal.fire({ title: "Error", text: "Error al crear el rol", icon: "error" });
        }
    } catch (error) {
        Swal.fire({ title: "Error", text: "Error al crear el rol", icon: "error" });
    }
};

  const handleCancel = () => {
    navigate("/roles");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crear Nuevo Rol
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <GenericForm
                title="Información del Rol"
                fields={roleFields}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                submitLabel="Crear Rol"
                onCancel={handleCancel}
                onFieldChange={(name, value) => {    
                    if (name === "name") {
                        setIsCustomRole(value === "Personalizado...");
                    }
                }}
            />
      </Box>
    </Container>
  );
};

export default CreateRole;