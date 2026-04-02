import { Box, Button, Container, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ACCESS_DENIED_MESSAGE,
  ACCESS_DENIED_STORAGE_KEY,
  FORBIDDEN_PAGE_TITLE,
} from "../constants/authMessages";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [detailMessage] = useState(() => {
    const key = ACCESS_DENIED_STORAGE_KEY;
    const v = sessionStorage.getItem(key);
    if (v) sessionStorage.removeItem(key);
    return v || undefined;
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
          <Typography variant="subtitle1" component="div" fontWeight={600} gutterBottom>
            {FORBIDDEN_PAGE_TITLE}
          </Typography>
          {detailMessage && detailMessage !== ACCESS_DENIED_MESSAGE && (
            <Typography variant="body2" color="text.secondary">
              {detailMessage}
            </Typography>
          )}
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
