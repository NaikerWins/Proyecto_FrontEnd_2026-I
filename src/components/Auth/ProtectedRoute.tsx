import { Navigate, Outlet } from 'react-router-dom';
import SecurityService from '../../services/securityService';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🛡️ Verificando autenticación...');
      const authStatus = SecurityService.isAuthenticated();
      console.log('🔐 Estado de autenticación:', authStatus);

      setIsAuthenticated(authStatus);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1">Verificando autenticación...</Typography>
      </Box>
    );
  }

  console.log('🎯 Redirigiendo:', isAuthenticated ? 'A la app' : 'Al login');

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;
