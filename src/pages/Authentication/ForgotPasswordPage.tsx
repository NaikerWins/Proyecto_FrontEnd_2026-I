import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ForgotPassword from './ForgotPassword';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/**
 * Google reCAPTCHA v3: se ejecuta de forma automática e invisible al enviar el
 * formulario de recuperación (executeRecaptcha en el submit; sin checkbox).
 * Mismo patrón que SignInPage.
 */
const ForgotPasswordPage = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <ForgotPassword />;
  }
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      language="es"
      scriptProps={{ async: true, defer: true, appendTo: 'head' }}
    >
      <ForgotPassword />
    </GoogleReCaptchaProvider>
  );
};

export default ForgotPasswordPage;
