import React, { useCallback, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
import RecaptchaLegalCorner from '../../components/Auth/RecaptchaLegalCorner';
import { obtainRecaptchaToken } from '../../utils/obtainRecaptchaToken';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/** Alineado con el mensaje genérico del backend (no revela si el email existe en BD). */
const PASSWORD_RESET_GENERIC_FALLBACK =
  'Si el email existe, recibirá instrucciones de recuperación';

type ForgotPasswordFormProps = {
  getCaptchaToken?: () => Promise<string | undefined>;
  /** Sin clave de sitio reCAPTCHA el back puede rechazar si exige captcha */
  showRecaptchaWarning?: boolean;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  getCaptchaToken,
  showRecaptchaWarning,
}) => {
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState(PASSWORD_RESET_GENERIC_FALLBACK);
  const [error, setError] = useState('');

  return (
    <>
      <Breadcrumb pageName="Recuperar contraseña" />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Recuperar contraseña
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mb: getCaptchaToken ? 1 : 3 }}
          >
            Indica el correo asociado a tu cuenta y pulsa «Enviar enlace».
          </Typography>
          {getCaptchaToken && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              align="center"
              sx={{ mb: 3 }}
            >
              Al enviar, Google reCAPTCHA v3 se ejecuta de forma automática e invisible
              (sin casilla); valida que la solicitud no sea automatizada.
            </Typography>
          )}

          {done && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {doneMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showRecaptchaWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Falta <code>VITE_RECAPTCHA_SITE_KEY</code> en <code>.env</code>. Si el
              backend tiene <code>security.recaptcha.enabled=true</code>, la solicitud
              puede fallar hasta configurar la misma pareja que{' '}
              <code>RECAPTCHA_SECRET</code> en el servidor.
            </Alert>
          )}

          {!done && (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={Yup.object({
                email: Yup.string()
                  .email('Email inválido')
                  .required('El email es obligatorio'),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                setError('');
                try {
                  let captchaToken: string | undefined;
                  if (getCaptchaToken) {
                    captchaToken = await getCaptchaToken();
                  }
                  const data = await SecurityService.requestPasswordReset(
                    values.email.trim(),
                    captchaToken,
                  );
                  const msg =
                    typeof data?.message === 'string' ? data.message.trim() : '';
                  setDoneMessage(msg || PASSWORD_RESET_GENERIC_FALLBACK);
                  setDone(true);
                } catch (e: unknown) {
                  const msg =
                    e instanceof Error
                      ? e.message
                      : 'No se pudo enviar la solicitud. Intente más tarde.';
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
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
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
                      'Enviar enlace'
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

      {getCaptchaToken ? <RecaptchaLegalCorner /> : null}
    </>
  );
};

/**
 * reCAPTCHA v3 al enviar; ref para no usar `executeRecaptcha` obsoleto del primer render.
 */
const ForgotPasswordWithRecaptcha: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const executeRef = useRef(executeRecaptcha);
  executeRef.current = executeRecaptcha;

  const getCaptchaToken = useCallback(
    () =>
      obtainRecaptchaToken(
        () => executeRef.current,
        'forgot_password',
        RECAPTCHA_SITE_KEY,
      ),
    [],
  );

  return <ForgotPasswordForm getCaptchaToken={getCaptchaToken} />;
};

const ForgotPassword: React.FC = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <ForgotPasswordForm showRecaptchaWarning />;
  }
  return <ForgotPasswordWithRecaptcha />;
};

export default ForgotPassword;
