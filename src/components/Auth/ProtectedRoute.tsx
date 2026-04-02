import { Navigate, Outlet } from 'react-router-dom';
import SecurityService from '../../services/securityService';
import { SESSION_INVALID_MESSAGE } from '../../constants/authMessages';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = SecurityService.isAuthenticated();
    setIsAuthenticated(authStatus);
    setIsChecking(false);
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

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/auth/signin"
      replace
      state={{ message: SESSION_INVALID_MESSAGE }}
    />
  );
};

export default ProtectedRoute;
