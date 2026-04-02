import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import SignIn from './SignIn';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const SignInPage = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return <SignIn />;
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
      <SignIn />
    </GoogleReCaptchaProvider>
  );
};

export default SignInPage;
