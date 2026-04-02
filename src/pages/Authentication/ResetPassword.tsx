import { useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import Breadcrumb from '../../components/Breadcrumb';
import SecurityService from '../../services/securityService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <>
        <Breadcrumb pageName="Restablecer contraseña" />
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Enlace inválido o incompleto. Solicita recuperar la contraseña desde el
              inicio de sesión.
            </Alert>
            <Link component={RouterLink} to="/auth/forgot-password">
              Ir a recuperación de contraseña
            </Link>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Nueva contraseña" />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Nueva contraseña
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Elige una contraseña segura para tu cuenta.
          </Typography>

          {done && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Contraseña actualizada. Ya puede iniciar sesión.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!done && (
            <Formik
              initialValues={{ newPassword: '', confirmPassword: '' }}
              validationSchema={Yup.object({
                newPassword: Yup.string()
                  .min(6, 'Mínimo 6 caracteres')
                  .required('Obligatorio'),
                confirmPassword: Yup.string()
                  .oneOf([Yup.ref('newPassword')], 'Las contraseñas no coinciden')
                  .required('Confirma la contraseña'),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                setError('');
                try {
                  await SecurityService.resetPasswordWithToken(
                    token,
                    values.newPassword,
                  );
                  setDone(true);
                  setTimeout(() => navigate('/auth/signin', { replace: true }), 2000);
                } catch (e: unknown) {
                  const msg =
                    e instanceof Error
                      ? e.message
                      : 'No se pudo actualizar la contraseña.';
                  setError(msg);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, handleSubmit, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Nueva contraseña"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    variant="outlined"
                    margin="normal"
                    disabled={isSubmitting}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    variant="outlined"
                    margin="normal"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 2, mb: 2, height: '48px' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Guardar contraseña'
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/auth/signin" variant="body2">
              Volver al inicio de sesión
            </Link>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ResetPassword;
