import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ForgotPassword from './ForgotPassword';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/**
 * reCAPTCHA v3 estándar (mismo criterio que SignInPage).
 */
const ForgotPasswordPage = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <ForgotPassword />;
  }
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY.trim()}
      useEnterprise={false}
      language="en"
      scriptProps={{
        appendTo: 'head',
        async: true,
        defer: true,
      }}
    >
      <ForgotPassword />
    </GoogleReCaptchaProvider>
  );
};

export default ForgotPasswordPage;
