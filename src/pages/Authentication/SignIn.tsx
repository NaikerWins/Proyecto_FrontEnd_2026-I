import React, { useCallback, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { User } from '../../models/User';
import SecurityService from '../../services/securityService';
//import Breadcrumb from '../../components/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
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
import { SESSION_INVALID_STORAGE_KEY } from '../../constants/authMessages';
import { obtainRecaptchaToken } from '../../utils/obtainRecaptchaToken';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const LOGIN_BUS_IMAGE = '/images/auth/prueba.png';

type SignInFormProps = {
  getCaptchaToken?: () => Promise<string | undefined>;

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
    (location.state as { message?: string } | undefined)?.message ??
    sessionFlash;
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
    } catch (error) {
      // Sessions es de otro microservicio — ignorar
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

      if (!captchaToken) {
        setError(
          'No se pudo validar reCAPTCHA. Comprueba la conexión, desactiva bloqueadores en esta página y que la clave de sitio sea reCAPTCHA v3. Luego intenta de nuevo.',
        );
        setLoading(false);
        return;
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
        setError('No se recibió un token de sesión válido del servidor.');
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

  const handleGoogleLogin = async (credentialResponse: {
    credential?: string;
  }) => {
    setProviderLoading('google');
    setError('');

    try {
      console.log('🔑 Credencial de Google recibida:', credentialResponse);

      if (!credentialResponse.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      // Manda el objeto completo con credential incluida
      const userData = await SecurityService.loginWithGoogle({
        credential: credentialResponse.credential, // ← token original para el backend
        ...jwtDecode(credentialResponse.credential), // ← datos decodificados para el fallback
      });

      console.log('✅ Login con Google exitoso:', userData);

      // Si es usuario nuevo, pide datos adicionales
      if (userData.isNewUser) {
        navigate('/auth/complete-profile', {
          state: {
            user: userData.user,
            token: userData.token,
            googleCredential: credentialResponse.credential, // ← agrega esto
          },
        });
        return;
      }

      await createSession(
        userData.user?.id || userData.id,
        credentialResponse.credential,
      );

      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);
      setError(error.message || 'Error al autenticar con Google.');
    } finally {
      setProviderLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setProviderLoading('github');
    setError('');

    try {
      const userData = await SecurityService.loginWithGitHub();

      console.log('✅ Login con GitHub exitoso:', userData);
      await createSession(userData.user?.id || userData.id, userData.token);

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
      console.log('✅ Login con Microsoft exitoso:', userData);
      await createSession(userData.user?.id || userData.id, userData.token);

      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al autenticar con Microsoft.';
      setError(message);
    } finally {
      setProviderLoading(null);
    }
  };

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google. Intenta de nuevo.');
    setProviderLoading(null);
  };

  const GOOGLE_CLIENT_ID =
    '408294359663-pihvunt5ou1h5nkul77du76vvlsq66d1.apps.googleusercontent.com';

  return (
    <>
      {/*
        <Breadcrumb pageName="Sign In" />
        */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#F1F5F9',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: { md: '1 1 44%' },
            minHeight: { xs: 200, sm: 240, md: 'auto' },
            backgroundImage: `url(${LOGIN_BUS_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(145deg, rgba(60, 80, 224, 0.93) 0%, rgba(60, 80, 224, 0.6) 42%, rgba(60, 80, 224, 0.28) 100%)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
              minHeight: { xs: 200, sm: 240, md: '100vh' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 6 },
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#fff',
                fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' },
                lineHeight: 1.2,
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Tus Buses
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(255, 255, 255, 0.92)',
                fontWeight: 400,
                maxWidth: 400,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.55,
              }}
            >
              Inicia sesión.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: { md: '1 1 56%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 3, md: 5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Container
            maxWidth="sm"
            disableGutters
            sx={{ maxWidth: { sm: 460 } }}
          >
            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
              >
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
                  Falta <code>VITE_RECAPTCHA_SITE_KEY</code> en{' '}
                  <code>.env</code>. Sin la clave de sitio reCAPTCHA v3 el login
                  puede devolver 403 (configura la misma pareja que{' '}
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
                    .min(8, 'La contraseña debe tener al menos 8 caracteres')
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

              {/* ---------------------------------------------------------------------------------------------------------------------------------*/}
              {/* Botones de proveedores OAuth */}
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
              >
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  {' '}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {' '}
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={handleGoogleError}
                      theme="filled_blue"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="300"
                      locale="es"
                    />{' '}
                  </Box>{' '}
                </GoogleOAuthProvider>

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
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                        alt="Microsoft"
                        style={{ width: 20, height: 20 }}
                      />
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
            </Paper>
          </Container>
        </Box>
      </Box>

      {getCaptchaToken ? <RecaptchaLegalCorner /> : null}
    </>
  );
};

/**
 * reCAPTCHA v3 al enviar el formulario. Ref + obtainRecaptchaToken evitan token vacío.
 */
const SignInWithRecaptcha: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const executeRef = useRef(executeRecaptcha);
  executeRef.current = executeRecaptcha;

  const getCaptchaToken = useCallback(
    () =>
      obtainRecaptchaToken(
        () => executeRef.current,
        'login',
        RECAPTCHA_SITE_KEY,
      ),
    [],
  );

  return <SignInForm getCaptchaToken={getCaptchaToken} />;
};

const SignIn: React.FC = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <SignInForm showRecaptchaWarning />;
  }
  return <SignInWithRecaptcha />;
};

export default SignIn;
