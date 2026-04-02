import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import SecurityService from "../../services/securityService";
import { useLocation, useNavigate } from "react-router-dom";
import { maskEmailForDisplay } from "../../utils/maskEmail";

const VERIFY_PATH = "/auth/verify-2fa";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(120);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const completedRef = useRef(false);
  const emailRef = useRef("");
  const [email, setEmail] = useState(
    () =>
      (location.state as { email?: string } | undefined)?.email ||
      sessionStorage.getItem("pending_2fa_email") ||
      ""
  );

  useEffect(() => {
    const fromState = (location.state as { email?: string } | undefined)?.email;
    if (fromState?.trim()) {
      sessionStorage.setItem("pending_2fa_email", fromState.trim());
      setEmail(fromState.trim());
    }
  }, [location.state]);

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    if (!email.trim()) {
      navigate("/auth/signin", {
        replace: true,
        state: { message: "Inicie sesión para recibir el código de verificación." },
      });
    }
  }, [email, navigate]);

  useEffect(() => {
    const onPopState = () => {
      if (completedRef.current) return;
      queueMicrotask(() => {
        if (completedRef.current) return;
        if (window.location.pathname !== VERIFY_PATH) {
          void SecurityService.cancelPending2FAOnServer(emailRef.current);
        }
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onPageHide = (ev: PageTransitionEvent) => {
      if (completedRef.current || ev.persisted) return;
      SecurityService.invalidatePartial2FASessionOnUnload(emailRef.current);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  const masked = email.trim() ? maskEmailForDisplay(email) : "[***@***.com]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("No se encontró el correo de verificación. Inicie sesión nuevamente.");
      navigate("/auth/signin", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      completedRef.current = true;
      const response = await SecurityService.verify2FA(email, code);
      if (response.token) {
        navigate("/", { replace: true });
      } else {
        completedRef.current = false;
      }
    } catch (err: any) {
      completedRef.current = false;
      const message = err?.message || "Código incorrecto o vencido.";

      if (message.toLowerCase().includes("demasiados intentos")) {
        SecurityService.logout();
        navigate("/auth/signin", {
          state: { message: "Demasiados intentos fallidos. Inicie sesión de nuevo." },
          replace: true,
        });
        return;
      }

      setAttempts((prevAttempts) => {
        const newAttempts = prevAttempts - 1;

        if (newAttempts <= 0) {
          SecurityService.logout();
          navigate("/auth/signin", {
            state: { message: "Demasiados intentos fallidos. Inicie sesión de nuevo." },
            replace: true,
          });
        } else {
          setError(`${message} Intentos restantes: ${newAttempts}`);
        }
        return newAttempts;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0 || loading) return;
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await SecurityService.resend2FACode(email);
      setTimer(120);
      setResendCooldown(45);
      setAttempts(3);
      setInfo("Se ha enviado un nuevo código a su correo.");
    } catch {
      setError("No se pudo reenviar el código. Intente más tarde o inicie sesión de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonToSignIn = async () => {
    completedRef.current = true;
    await SecurityService.cancelPending2FAOnServer(email);
    navigate("/auth/signin", {
      replace: true,
      state: { message: "Verificación en dos pasos cancelada. Puede iniciar sesión de nuevo." },
    });
  };

  if (!email.trim()) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Verificación de seguridad (2FA)
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, px: 1 }}>
            Ingrese el código de 6 dígitos enviado a su email {masked}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{
                maxLength: 6,
                style: { textAlign: "center", letterSpacing: "0.5em", fontSize: "1.8rem", fontWeight: "bold" },
              }}
              disabled={loading || timer === 0}
              autoFocus
              sx={{ mb: 2 }}
            />

            <Typography
              variant="caption"
              display="block"
              color={timer < 20 ? "error" : "text.secondary"}
              sx={{ mb: 2 }}
            >
              El código expira en: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </Typography>

            {info && (
              <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
                {info}
              </Typography>
            )}

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2, fontWeight: "medium" }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || timer === 0 || code.length < 6}
              sx={{ height: "54px", textTransform: "none", fontSize: "1.1rem" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar y continuar"}
            </Button>
          </form>

          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ¿No recibió el código? Revisar spam o{" "}
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                sx={{ verticalAlign: "baseline", fontWeight: 600 }}
              >
                reenviar
              </MuiLink>
              {resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Revise también la carpeta de correo no deseado (spam).
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button variant="text" size="small" onClick={handleAbandonToSignIn} disabled={loading}>
              Volver al inicio de sesión
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Verify2FA;
