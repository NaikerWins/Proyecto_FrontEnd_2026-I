import { useEffect } from 'react';
import { Box, Link, Tooltip } from '@mui/material';

const RECAPTCHA_LOGO =
  'https://www.gstatic.com/recaptcha/api2/logo_48.png';

const tooltipContent = (
  <Box
    component="span"
    sx={{
      display: 'block',
      typography: 'caption',
      lineHeight: 1.5,
      textAlign: 'left',
    }}
  >
    Este sitio está protegido por reCAPTCHA v3. 
    Aplican la{' '}
    <Link
      href="https://policies.google.com/privacy"
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
      underline="always"
      sx={{ fontWeight: 600 }}
    >
      Política de Privacidad
    </Link>{' '}
    y los{' '}
    <Link
      href="https://policies.google.com/terms"
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
      underline="always"
      sx={{ fontWeight: 600 }}
    >
      Términos de Servicio
    </Link>{' '}
    de Google.
  </Box>
);

/**
 * Distintivo reCAPTCHA v3 en la esquina inferior izquierda; el texto legal completo se muestra al pasar el cursor.
 * Oculta el badge flotante por defecto de Google (se exige mostrar información equivalente).
 */
const RecaptchaLegalCorner = () => {
  useEffect(() => {
    document.body.classList.add('recaptcha-custom-legal');
    return () => document.body.classList.remove('recaptcha-custom-legal');
  }, []);

  return (
    <Tooltip
      title={tooltipContent}
      placement="top-start"
      enterDelay={200}
      leaveDelay={400}
      disableInteractive={false}
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: 380,
            bgcolor: 'grey.900',
            color: 'grey.100',
            p: 1.5,
            borderRadius: 1,
            '& a': { color: 'primary.light' },
          },
        },
      }}
    >
      <Box
        component="span"
        role="img"
        aria-label="reCAPTCHA: pase el cursor para más información"
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1300,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          p: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box
          component="img"
          src={RECAPTCHA_LOGO}
          alt=""
          sx={{ height: 28, width: 'auto', display: 'block', verticalAlign: 'middle' }}
        />
      </Box>
    </Tooltip>
  );
};

export default RecaptchaLegalCorner;
