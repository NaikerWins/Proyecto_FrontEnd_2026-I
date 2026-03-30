import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import SignIn from './SignIn';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/**
 * reCAPTCHA v3 solo en /auth/signin: carga el script aquí. La verificación se ejecuta
 * automáticamente al enviar el formulario email/contraseña, sin interacción del usuario
 * con el widget (sin checkbox; `executeRecaptcha` solo en el submit).
 */
const SignInPage = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <SignIn />;
  }
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      language="es"
      scriptProps={{ async: true, defer: true, appendTo: 'head' }}
    >
      <SignIn />
    </GoogleReCaptchaProvider>
  );
};

export default SignInPage;
