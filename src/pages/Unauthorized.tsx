import { Box, Button, Container, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ACCESS_DENIED_MESSAGE,
  ACCESS_DENIED_STORAGE_KEY,
} from "../constants/authMessages";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [apiMessage] = useState(() => {
    const key = ACCESS_DENIED_STORAGE_KEY;
    const v = sessionStorage.getItem(key);
    if (v) sessionStorage.removeItem(key);
    return v || undefined;
  });
  const headline = apiMessage || ACCESS_DENIED_MESSAGE;

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
          <Typography variant="subtitle2" component="div" fontWeight={600} gutterBottom>
            Error 403
          </Typography>
          <Typography variant="body2">{headline}</Typography>
        </Alert>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No tiene permisos para acceder a este recurso.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/", { replace: true })}>
          Volver al inicio
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
