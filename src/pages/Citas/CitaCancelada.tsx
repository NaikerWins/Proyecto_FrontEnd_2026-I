import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const CitaCancelada: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
                Cita cancelada
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Tu cita ha sido cancelada exitosamente y eliminada del calendario.
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() => navigate("/citas/agendar")}
            >
                Agendar nueva cita
            </Button>
        </Container>
    );
};

export default CitaCancelada;