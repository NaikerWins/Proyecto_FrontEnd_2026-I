import React, { useCallback, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { User } from '../../models/User';
import SecurityService from '../../services/securityService';
import Breadcrumb from '../../components/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { GitHub, Microsoft } from '@mui/icons-material';
import { SessionService } from '../../services/sessionsService';
import RecaptchaLegalCorner from '../../components/Auth/RecaptchaLegalCorner';
import {
  SESSION_INVALID_STORAGE_KEY,
} from '../../constants/authMessages';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

type SignInFormProps = {
  getCaptchaToken?: () => Promise<string | undefined>;
  /** Sin VITE_RECAPTCHA_SITE_KEY el login fallará si el back exige captcha */
  showRecaptchaWarning?: boolean;
};

const SignInForm: React.FC<SignInFormProps> = ({
  getCaptchaToken,
  showRecaptchaWarning,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionFlash] = useState(() => {
    const v = sessionStorage.getItem(SESSION_INVALID_STORAGE_KEY);
    if (v) sessionStorage.removeItem(SESSION_INVALID_STORAGE_KEY);
    return v || undefined;
  });
  const infoMessage =
    (location.state as { message?: string } | undefined)?.message ?? sessionFlash;
  const [providerLoading, setProviderLoading] = useState<string | null>(null);

  const createSession = async (userId: string | number, token: string) => {
    try {
      const FACode = Math.floor(100000 + Math.random() * 900000).toString();
      await SessionService.create(userId, {
        token,
        FACode,
        state: 'active',
        expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
      });
    } catch {
      /* Sessions es otro microservicio */
    }
  };

  const handleLogin = async (user: User) => {
    setLoading(true);
    setError('');
    const emailTrim = String(user.email ?? '').trim();
    if (!emailTrim) {
      setError('Ingresa tu correo electrónico.');
      setLoading(false);
      return;
    }
    try {
      // reCAPTCHA v3 invisible: executeRecaptcha solo al enviar el formulario (sin interacción previa con el widget).
      let captchaToken: string | undefined;
      if (getCaptchaToken) {
        captchaToken = await getCaptchaToken();
      }

      const response = (await SecurityService.login({
        ...user,
        email: emailTrim,
        captchaToken: captchaToken ?? user.captchaToken,
      })) as {
        needsVerification?: boolean;
        status?: string;
        email?: string;
        token?: string;
        user?: unknown;
      };

      if (response.needsVerification) {
        const email = response.email || user.email;
        navigate('/auth/verify-2fa', {
          replace: true,
          state: email ? { email } : undefined,
        });
        return;
      }

      /** Paso 1 de 2FA: no exigir `!user` en la respuesta (a veces viene `user` vacío o parcial). */
      const needs2FA =
        String(response?.status ?? '').toUpperCase() === 'VERIFY_2FA' ||
        (!response?.token &&
          String(response?.email ?? user.email ?? '').trim() !== '');

      if (needs2FA) {
        const email = (response.email as string | undefined) || user.email;
        navigate('/auth/verify-2fa', {
          replace: true,
          state: email ? { email } : undefined,
        });
        return;
      }

      const token = response.token;
      if (!token) {
        setError(
          'No se recibió un token de sesión válido del servidor.',
        );
        return;
      }

      const u = response.user || response;
      if (u && token) {
        await createSession((u as { id?: string | number }).id || 1, token);
      }
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: { credential?: string }) => {
    setProviderLoading('google');
    setError('');

    try {
      if (!credentialResponse.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      const userData = await SecurityService.loginWithGoogle({
        credential: credentialResponse.credential,
        ...jwtDecode(credentialResponse.credential),
      });

      if (userData.isNewUser) {
        navigate('/auth/complete-profile', {
          state: {
            user: userData.user,
            token: userData.token,
            googleCredential: credentialResponse.credential,
          },
        });
        return;
      }

      await createSession(
        userData.user?.id || userData.id,
        credentialResponse.credential,
      );

      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al autenticar con Google.';
      setError(message);
    } finally {
      setProviderLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setProviderLoading('github');
    setError('');

    try {
      const userData = await SecurityService.loginWithGitHub();
      await createSession(userData.id || 'githubUser', 'github-token');

      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al autenticar con GitHub.';
      setError(message);
    } finally {
      setProviderLoading(null);
    }
  };

  const handleMicrosoftLogin = async () => {
    setProviderLoading('microsoft');
    setError('');

    try {
      const userData = await SecurityService.loginWithMicrosoft();
      await createSession(userData.id || 'microsoftUser', 'microsoft-token');

      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al autenticar con Microsoft.';
      setError(message);
    } finally {
      setProviderLoading(null);
    }
  };

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google. Intenta de nuevo.');
    setProviderLoading(null);
  };

  return (
    <>
      <Breadcrumb pageName="Sign In" />

      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Iniciar Sesión
          </Typography>

          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Bienvenido de vuelta, por favor ingresa tus credenciales
          </Typography>

          {infoMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {infoMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showRecaptchaWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Falta <code>VITE_RECAPTCHA_SITE_KEY</code> en <code>.env</code>. Sin la clave de
              sitio reCAPTCHA v3 el login puede devolver 403 (configura la misma pareja que{' '}
              <code>RECAPTCHA_SECRET</code> en el backend).
            </Alert>
          )}

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email('Email inválido')
                .required('El email es obligatorio'),
              password: Yup.string()
                .min(6, 'La contraseña debe tener al menos 6 caracteres')
                .required('La contraseña es obligatoria'),
            })}
            onSubmit={(values) => {
              void handleLogin(values);
            }}
          >
            {({ errors, touched, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    margin="normal"
                    disabled={loading}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    margin="normal"
                    disabled={loading}
                  />
                </Box>

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/auth/forgot-password"
                    variant="body2"
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    ¿Olvidó su contraseña?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mb: 3, height: '48px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
              o continúa con
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
                locale="es"
              />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGitHubLogin}
              disabled={!!providerLoading}
              startIcon={
                providerLoading === 'github' ? (
                  <CircularProgress size={20} />
                ) : (
                  <GitHub />
                )
              }
              sx={{
                height: '48px',
                textTransform: 'none',
                color: 'text.primary',
                borderColor: 'grey.400',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50',
                },
              }}
            >
              {providerLoading === 'github'
                ? 'Conectando con GitHub...'
                : 'Continuar con GitHub'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleMicrosoftLogin}
              disabled={!!providerLoading}
              startIcon={
                providerLoading === 'microsoft' ? (
                  <CircularProgress size={20} />
                ) : (
                  <Microsoft />
                )
              }
              sx={{
                height: '48px',
                textTransform: 'none',
                color: 'text.primary',
                borderColor: 'grey.400',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50',
                },
              }}
            >
              {providerLoading === 'microsoft'
                ? 'Conectando con Microsoft...'
                : 'Continuar con Microsoft'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              ¿No tienes una cuenta?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/auth/signup')}
                sx={{ textTransform: 'none' }}
                disabled={loading || !!providerLoading}
              >
                Regístrate aquí
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>

      {getCaptchaToken ? <RecaptchaLegalCorner /> : null}
    </>
  );
};

const RECAPTCHA_RETRIES = 20;
const RECAPTCHA_RETRY_MS = 200;

/**
 * Requisito: reCAPTCHA v3 se ejecuta automáticamente al enviar el formulario email/contraseña,
 * sin interacción del usuario con el widget (sin checkbox). No se llama a executeRecaptcha al montar la página.
 */
const SignInWithRecaptcha: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    for (let attempt = 0; attempt < RECAPTCHA_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RECAPTCHA_RETRY_MS));
      }
      try {
        if (!executeRecaptcha) continue;
        const t = await executeRecaptcha('login');
        if (t && String(t).trim()) {
          return t.trim();
        }
      } catch {
        /* script aún no listo: reintento en el mismo envío */
      }
    }
    return undefined;
  }, [executeRecaptcha]);

  return <SignInForm getCaptchaToken={getCaptchaToken} />;
};

const SignIn: React.FC = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <SignInForm showRecaptchaWarning />;
  }
  return <SignInWithRecaptcha />;
};

export default SignIn;
