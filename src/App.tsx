import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ECommerce from './pages/Dashboard/ECommerce';
import SignInPage from './pages/Authentication/SignInPage';
import SignUp from './pages/Authentication/SignUp';
import CompleteProfile from './pages/Authentication/CompleteProfile';
import Verify2FA from './components/Auth/Verify2FA';
import ForgotPasswordPage from './pages/Authentication/ForgotPasswordPage';
import ResetPassword from './pages/Authentication/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import Loader from './common/Loader';
import {
  administrationRoutes,
  generalRoutes,
} from './routes';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdministrationRoute from './components/Auth/AdministrationRoute';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '408294359663-pihvunt5ou1h5nkul77du76vvlsq66d1.apps.googleusercontent.com';

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.info(
      '[Google OAuth] Si ves "origin is not allowed", en Google Cloud → Credenciales → OAuth Web client → Orígenes JavaScript autorizados, añade exactamente:',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      '(y el origen actual)',
      window.location.origin,
    );
  }, []);

  const routeElements = (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUp />}/>
        <Route path="/auth/complete-profile" element={<CompleteProfile />} />
        <Route path="/auth/verify-2fa" element={<Verify2FA />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<ECommerce />} />
            {generalRoutes.map((routeItem, index) => {
              const { path, component: Component } = routeItem;
              return (
                <Route
                  key={`g-${index}`}
                  path={path}
                  element={
                    <Suspense fallback={<Loader />}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}
            <Route element={<AdministrationRoute />}>
              {administrationRoutes.map((routeItem, index) => {
                const { path, component: Component } = routeItem;
                return (
                  <Route
                    key={`a-${index}`}
                    path={path}
                    element={
                      <Suspense fallback={<Loader />}>
                        <Component />
                      </Suspense>
                    }
                  />
                );
              })}
            </Route>
          </Route>
        </Route>

      </Routes>
    </>
  );
  return loading ? (
    <Loader />
  ) : (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {routeElements}
    </GoogleOAuthProvider>
  );
}
export default App;
