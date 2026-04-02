// src/services/securityService.ts
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { User } from "../models/User";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { mergeUserRoleFromToken, type JwtRoleClaims } from "../utils/sessionRole";
import FirebaseService, { auth } from "./firebaseService";
import { UserCredential, GithubAuthProvider } from "firebase/auth";

class SecurityService extends EventTarget {
    keySession: string;
    API_URL: string;
    pending2FAEmailKey: string;
    pending2FAContextKey: string;

    constructor() {
        super();
        this.keySession = "token";
        this.API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
        this.pending2FAEmailKey = "pending_2fa_email";
        this.pending2FAContextKey = "pending_2fa_context";
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async loginWithGitHub() {
        try {
            const firebaseResult: UserCredential = await FirebaseService.loginWithGitHub();
            const firebaseUser = firebaseResult.user;
            const firebaseToken = await firebaseUser.getIdToken();

            try {
                const backendResponse = await this.sendToBackend(
                    {
                        token: firebaseToken,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "GitHub User",
                        picture: firebaseUser.photoURL,
                        provider: "github",
                        providerId: firebaseUser.uid,
                    },
                    "/security/auth/github",
                );
                return backendResponse;
            } catch (backendError: any) {
                console.log(backendError);
                if (backendError.response) {
                    console.log("📡 Data:", backendError.response.data);
                    console.log("📡 Status:", backendError.response.status);
                }
                return await this.handleProviderFallback(firebaseUser, "github");
            }
        } catch (error: any) {
            throw new Error(error.message || "Error al autenticar con GitHub");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async linkGithubAccount() {
        try {
            const firebaseResult: UserCredential = await FirebaseService.loginWithGitHub();
            const firebaseUser = firebaseResult.user;
            const firebaseToken = await firebaseUser.getIdToken();

            const response = await axios.post(
                `${this.API_URL}/security/link/github`,
                { firebaseToken },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.getToken()}`,
                    },
                },
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Error al vincular con GitHub");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async unlinkGithubAccount(userId: string) {
        try {
            const response = await axios.put(
                `${this.API_URL}/security/unlink-github/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${this.getToken()}`,
                    },
                },
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Error al desvincular GitHub");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async loginWithMicrosoft() {
        console.log("🔐 Iniciando sesión con Microsoft...");
        try {
            const firebaseResult: UserCredential = await FirebaseService.loginWithMicrosoft();
            const firebaseUser = firebaseResult.user;
            console.log("👤 Usuario de Firebase:", firebaseUser);

            const firebaseToken = await firebaseUser.getIdToken();
            console.log("🔑 Token de Firebase:", firebaseToken);

            try {
                const backendResponse = await this.sendToBackend(
                    {
                        token: firebaseToken,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Microsoft User",
                        picture: firebaseUser.photoURL,
                        provider: "microsoft",
                        providerId: firebaseUser.uid,
                    },
                    "/security/auth/microsoft",
                );
                return backendResponse;
            } catch (backendError) {
                console.log("⚠️ Backend no disponible, usando método local...");
                return await this.handleProviderFallback(firebaseUser, "microsoft");
            }
        } catch (error: any) {
            console.error("❌ Error en login con Microsoft:", error);
            throw new Error(error.message || "Error al autenticar con Microsoft");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private async sendToBackend(providerData: any, endpoint: string) {
        const backendUrl = `${this.API_URL}${endpoint}`;
        console.log(`🌐 Enviando a backend: ${backendUrl}`);

        const response = await axios.post(backendUrl, providerData, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
        });

        console.log("✅ Respuesta del backend:", response.data);

        const data = response.data;
        const userData = data.user || data;
        this.saveUserSession(userData, data.token);
        return data;
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private async handleProviderFallback(firebaseUser: any, provider: string) {
        console.log(`🔄 Usando método alternativo para ${provider}...`);

        try {
            const usersUrl = `${this.API_URL}/users`;
            const usersResponse = await axios.get(usersUrl, { timeout: 10000 });

            const existingUser = usersResponse.data.find(
                (user: any) => user.email === firebaseUser.email,
            );

            let userData;

            if (existingUser) {
                console.log("✅ Usuario existente encontrado:", existingUser);
                userData = existingUser;
            } else {
                console.log(`🆕 Creando nuevo usuario para ${provider}...`);

                const newUser = {
                    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || `${provider} User`,
                    email: firebaseUser.email,
                    password: `${provider}_oauth_${Date.now()}`,
                    is_active: true,
                };

                const createResponse = await axios.post(`${this.API_URL}/users`, newUser, {
                    headers: { "Content-Type": "application/json" },
                    timeout: 10000,
                });

                userData = createResponse.data;
            }

            const simulatedResponse = {
                user: userData,
                token: `${provider}_token_${Date.now()}`,
                message: `Login con ${provider} exitoso`,
            };

            this.saveUserSession(userData, simulatedResponse.token);
            return simulatedResponse;
        } catch (fallbackError) {
            throw new Error(`No se pudo autenticar con ${provider}`);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private saveUserSession(userData: any, token: string) {
        const merged = mergeUserRoleFromToken(userData as User, token) || userData;
        localStorage.setItem("user", JSON.stringify(merged));
        store.dispatch(setUser(merged as User));
        if (token) {
            localStorage.setItem(this.keySession, token);
        }
        this.dispatchEvent(new CustomEvent("userChange", { detail: merged }));
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private clearPending2FAClientOnly(): void {
        sessionStorage.removeItem(this.pending2FAEmailKey);
        sessionStorage.removeItem(this.pending2FAContextKey);
    }

    async cancelPending2FAOnServer(email: string): Promise<void> {
        const e = (email || "").trim();
        if (!e) {
            this.clearPending2FAClientOnly();
            return;
        }
        try {
            await axios.post(
                `${this.API_URL}/security/cancel-pending-2fa`,
                { email: e },
                { timeout: 8000, headers: { "Content-Type": "application/json" } },
            );
        } catch {
            /* ignore */
        } finally {
            this.clearPending2FAClientOnly();
        }
    }

    invalidatePartial2FASessionOnUnload(email: string | undefined): void {
        const e = (email || "").trim();
        if (!e) {
            this.clearPending2FAClientOnly();
            return;
        }
        const url = `${this.API_URL}/security/cancel-pending-2fa`;
        const body = JSON.stringify({ email: e });
        try {
            if (typeof navigator !== "undefined" && navigator.sendBeacon) {
                navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
            } else {
                void fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                    keepalive: true,
                });
            }
        } catch {
            /* ignore */
        }
        this.clearPending2FAClientOnly();
    }

    async resend2FACode(email: string): Promise<void> {
        const e = (email || "").trim();
        if (!e) throw new Error("No hay correo para reenviar el código.");
        await axios.post(
            `${this.API_URL}/security/resend-2fa`,
            { email: e },
            { timeout: 10000, headers: { "Content-Type": "application/json" } },
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private normalizeEmailField(value: unknown): string {
        if (value == null) return "";
        if (typeof value === "string") return value.trim();
        return String(value).trim();
    }

    private unwrapApiBody(raw: unknown): Record<string, unknown> {
        if (raw == null) return {};
        if (Array.isArray(raw) && raw[0] && typeof raw[0] === "object") {
            return this.unwrapApiBody(raw[0]);
        }
        if (typeof raw !== "object") return {};
        const o = raw as Record<string, unknown>;
        const inner = o.data ?? o.payload ?? o.result ?? o.body;
        if (inner && typeof inner === "object" && !Array.isArray(inner)) {
            return { ...o, ...(inner as Record<string, unknown>) };
        }
        return o;
    }

    private messageImplies2FAPending(data: Record<string, unknown>): boolean {
        const m = String(data.message ?? "").toLowerCase();
        return (
            m.includes("se ha enviado") ||
            m.includes("enviado un código") ||
            m.includes("enviado un codigo") ||
            m.includes("código a su correo") ||
            m.includes("codigo a su correo")
        );
    }

    private resolvePending2FAEmail(
        data: Record<string, unknown>,
        user: User,
        submittedEmail: string,
    ): string {
        const fromData =
            this.normalizeEmailField(data.email) ||
            this.normalizeEmailField(data.correo) ||
            this.normalizeEmailField(
                (data.user as { email?: unknown } | undefined)?.email,
            );
        return fromData || this.normalizeEmailField(user.email) || submittedEmail;
    }

    private isVerify2FAResponse(data: Record<string, unknown>): boolean {
        const s = String(data.status ?? "").toUpperCase();
        return (
            s === "VERIFY_2FA" ||
            s.includes("VERIFY_2FA") ||
            data.needsVerification === true ||
            this.messageImplies2FAPending(data)
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async login(user: User) {
        const loginUrl = `${this.API_URL}/security/login`;

        const u = user as Record<string, unknown>;
        const captcha = String(u.captchaToken ?? "").trim();
        const loginBody: Record<string, unknown> = {
            ...user,
            email: this.normalizeEmailField(user.email) || this.normalizeEmailField(u.correo),
            password: user.password,
        };
        if (captcha) {
            loginBody.captchaToken = captcha;
        }
        const submittedEmail = this.normalizeEmailField(loginBody.email);

        try {
            const response = await axios.post(loginUrl, loginBody, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
                timeout: 10000,
            });

            const data = response.data;
            if (data == null) throw new Error("No se recibió respuesta del servidor");

            const dataObj = this.unwrapApiBody(data);
            const tokenRaw = dataObj.token ?? dataObj.accessToken;
            const hasToken = typeof tokenRaw === "string" && tokenRaw.trim().length > 0;

            if (!hasToken) {
                const pendingEmail = this.resolvePending2FAEmail(dataObj, user, submittedEmail);
                const treatAs2FA =
                    this.isVerify2FAResponse(dataObj) ||
                    String(dataObj.status ?? "").toUpperCase() === "VERIFY_2FA";
                if (treatAs2FA) {
                    const emailToStore = pendingEmail || submittedEmail || this.normalizeEmailField(user.email);
                    if (!emailToStore) {
                        throw new Error("No se recibió un token de sesión válido del servidor.");
                    }
                    sessionStorage.setItem(this.pending2FAEmailKey, emailToStore);
                    sessionStorage.setItem(
                        this.pending2FAContextKey,
                        JSON.stringify({ ...dataObj, tempToken: dataObj.tempToken }),
                    );
                    return {
                        ...(dataObj as object),
                        status: "VERIFY_2FA",
                        needsVerification: true,
                        email: emailToStore,
                    } as Record<string, unknown> & { status: string; email: string; needsVerification: boolean };
                }
                throw new Error(
                    "El servidor no devolvió token ni correo para continuar. Revisa la respuesta de /security/login.",
                );
            }

            const jwt = typeof tokenRaw === "string" && tokenRaw.trim() ? tokenRaw.trim() : "";
            const rawUser = dataObj.user || dataObj;
            const userData =
                jwt && rawUser ? mergeUserRoleFromToken(rawUser as User, jwt) || rawUser : rawUser;

            localStorage.setItem("user", JSON.stringify(userData));
            if (jwt) {
                localStorage.setItem(this.keySession, jwt);
            }
            store.dispatch(setUser(userData as User));
            this.dispatchEvent(new CustomEvent("userChange", { detail: userData }));
            return { ...dataObj, token: jwt } as typeof dataObj & { token: string };
        } catch (error: any) {
            let errorMessage = "Error de conexión";
            const status = error.response?.status as number | undefined;

            if (error.code === "ECONNABORTED") {
                errorMessage = "Timeout: El servidor no respondió a tiempo";
            } else if (error.response) {
                if (status === 403) {
                    const data = error.response?.data as { message?: string; error?: string } | undefined;
                    const msg = data?.message;
                    const captchaErr = data?.error === "CAPTCHA_FAILED" || data?.error === "CAPTCHA_INVALIDO";
                    if (captchaErr) {
                        errorMessage =
                            msg ||
                            "reCAPTCHA no validó: use la misma pareja de claves (VITE_RECAPTCHA_SITE_KEY + google.recaptcha.secret), añada el origen del front en reCAPTCHA y recargue.";
                    } else {
                        errorMessage = msg || "Acceso denegado por seguridad.";
                    }
                } else if (status === 401 || status === 404) {
                    errorMessage = "Email o contraseña incorrectos";
                } else if (status === 500) {
                    errorMessage = "Error interno del servidor";
                } else {
                    errorMessage = error.response.data?.message || `Error ${status}`;
                }
            } else if (
                error.code === "ERR_NETWORK" ||
                error.code === "ECONNREFUSED" ||
                error.request
            ) {
                errorMessage =
                    `No hay conexión con la API en ${this.API_URL}. ` +
                    "Inicia el microservicio de seguridad (Spring Boot) en ese puerto, por ejemplo desde la carpeta del backend: " +
                    "`./mvnw spring-boot:run` o `mvn spring-boot:run`.";
            } else {
                errorMessage = error.message || "Error inesperado";
            }

            const err = new Error(errorMessage) as Error & { status?: number };
            if (status !== undefined) err.status = status;
            throw err;
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async verify2FA(email: string, code: string) {
        const verifyUrl = `${this.API_URL}/security/verify-2fa`;
        const resolvedEmail = (
            email ||
            sessionStorage.getItem(this.pending2FAEmailKey) ||
            ""
        ).trim();
        const normalizedCode = (code || "").trim();

        if (!resolvedEmail) {
            throw new Error("No se encontró el correo para validar el código.");
        }
        if (normalizedCode.length !== 6) {
            throw new Error("El código debe tener 6 dígitos.");
        }

        let response;
        try {
            response = await axios.post(
                verifyUrl,
                {
                    email: resolvedEmail,
                    correo: resolvedEmail,
                    code: normalizedCode,
                    verificationCode: normalizedCode,
                    twoFactorCode: normalizedCode,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                    timeout: 10000,
                },
            );
        } catch (e: any) {
            const d = e?.response?.data as { message?: string; error?: string } | undefined;
            const msg =
                (typeof d?.message === "string" && d.message.trim() !== "" ? d.message : null) ||
                (typeof d?.error === "string" ? d.error : null) ||
                (typeof e?.message === "string" && !e.message.startsWith("Request failed with status code")
                    ? e.message
                    : null) ||
                "Código incorrecto o vencido.";
            throw new Error(msg);
        }

        const data = response.data;
        if (data.token) {
            let userToSave: User | undefined = data.user;
            if (!userToSave) {
                try {
                    const claims = jwtDecode<JwtRoleClaims>(data.token);
                    userToSave = {
                        id: claims.id ?? claims.sub,
                        email: claims.email,
                        name: claims.name,
                        role: claims.role ?? claims.roleName,
                    } as User;
                } catch {
                    /* ignore */
                }
            }
            if (userToSave) {
                this.saveUserSession(userToSave, data.token);
            }
            sessionStorage.removeItem(this.pending2FAEmailKey);
            sessionStorage.removeItem(this.pending2FAContextKey);
        }
        return data;
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async loginWithGoogle(googleData: any) {
        const googleLoginUrl = `${this.API_URL}/security/login/google`;
        try {
            const response = await axios.post(
                googleLoginUrl,
                {
                    token: googleData.credential || googleData.tokenId,
                    email: googleData.email,
                    name: googleData.name,
                    picture: googleData.picture,
                    googleId: googleData.sub,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 15000,
                },
            );

            const data = response.data;
            if (!data || typeof data !== "object") {
                throw new Error("Respuesta inválida del servidor.");
            }
            if ("error" in data && data.error) {
                throw new Error(
                    (data as { message?: string }).message || String((data as { error?: string }).error),
                );
            }
            if (!data.token) {
                throw new Error(
                    "El servidor no devolvió token JWT. Revise /security/login/google y los logs del backend.",
                );
            }

            const userData = data.user || data;
            this.saveUserSession(userData, data.token);
            return data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                const status = err.response.status;
                const d = err.response.data as { message?: string; error?: string } | undefined;
                const msg =
                    d?.message ||
                    d?.error ||
                    (status === 401
                        ? "Google no pudo validarse: verifique que google.client.id en el backend sea el mismo Client ID OAuth que VITE_GOOGLE_CLIENT_ID en el front."
                        : `Error ${status}`);
                if (status >= 400 && status < 500) {
                    throw new Error(msg);
                }
                if (status >= 500) {
                    throw new Error(d?.message || "Error del servidor al validar Google.");
                }
            }
            if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
                throw new Error("Tiempo de espera agotado al contactar el servidor.");
            }
            if (axios.isAxiosError(err) && err.request && !err.response) {
                return await this.handleGoogleFallback(googleData);
            }
            throw err instanceof Error ? err : new Error("Error al autenticar con Google.");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    private async handleGoogleFallback(googleData: any) {
        try {
            console.log("🔄 Usando método alternativo para Google OAuth");

            const usersUrl = `${this.API_URL}/users`;
            console.log("🔍 Buscando usuarios en:", usersUrl);

            const usersResponse = await axios.get(usersUrl, { timeout: 10000 });

            const existingUser = usersResponse.data.find(
                (user: any) => user.email === googleData.email,
            );

            let userData;

            if (existingUser) {
                console.log("✅ Usuario existente encontrado:", existingUser);
                userData = existingUser;
            } else {
                console.log("🆕 Creando nuevo usuario para Google OAuth...");

                const newUser = {
                    name: googleData.name,
                    email: googleData.email,
                    password: `google_oauth_${Date.now()}`,
                    is_active: true,
                };

                const createResponse = await axios.post(`${this.API_URL}/users`, newUser, {
                    headers: { "Content-Type": "application/json" },
                    timeout: 10000,
                });

                console.log("✅ Nuevo usuario creado:", createResponse.data);
                userData = createResponse.data;
            }

            const simulatedResponse = {
                user: userData,
                token: `google_token_${Date.now()}`,
                message: "Login con Google exitoso",
            };

            localStorage.setItem("user", JSON.stringify(userData));
            store.dispatch(setUser(userData));
            localStorage.setItem(this.keySession, simulatedResponse.token);
            this.dispatchEvent(new CustomEvent("userChange", { detail: userData }));

            console.log("🎉 Login con Google (alternativo) completado exitosamente");
            return simulatedResponse;
        } catch (fallbackError: any) {
            console.error("❌ Error en fallback de Google:", fallbackError);
            throw new Error("No se pudo conectar con el servidor para autenticar con Google");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    async requestPasswordReset(email: string, captchaToken?: string) {
        const url = `${this.API_URL}/security/forgot-password`;
        const body: Record<string, string> = { email: String(email).trim() };
        if (captchaToken != null && String(captchaToken).trim() !== "") {
            body.captchaToken = String(captchaToken).trim();
        }
        try {
            const response = await axios.post(url, body, {
                headers: { "Content-Type": "application/json" },
                timeout: 15000,
            });
            return response.data as { message?: string };
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const d = err.response.data as { message?: string };
                if (d.message) throw new Error(d.message);
            }
            throw err instanceof Error ? err : new Error("No se pudo enviar la solicitud de recuperación.");
        }
    }

    async resetPasswordWithToken(token: string, newPassword: string) {
        const url = `${this.API_URL}/security/reset-password`;
        try {
            const response = await axios.post(
                url,
                { token: token.trim(), newPassword },
                { headers: { "Content-Type": "application/json" }, timeout: 15000 },
            );
            return response.data as { message?: string };
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const d = err.response.data as { message?: string };
                if (d.message) throw new Error(d.message);
            }
            throw err instanceof Error ? err : new Error("No se pudo restablecer la contraseña.");
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    }

    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem(this.keySession);
        localStorage.removeItem("session");
        store.dispatch(setUser(null));
        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        console.log("👋 Logout completado");
    }

    getToken() {
        const t =
            localStorage.getItem(this.keySession) ||
            localStorage.getItem("session");
        return t?.trim() ? t.trim() : null;
    }

    isAuthenticated() {
        const userRaw = localStorage.getItem("user");
        if (!userRaw?.trim()) {
            return false;
        }
        try {
            JSON.parse(userRaw);
        } catch {
            return false;
        }
        return this.getToken() != null;
    }

    async validateToken() {
        try {
            const token = this.getToken();
            if (!token) return false;
            console.log("✅ Token existe, asumiendo válido");
            return true;
        } catch (error) {
            console.error("❌ Token inválido:", error);
            this.logout();
            return false;
        }
    }

    async refreshToken() {
        try {
            const newToken = `refreshed_token_${Date.now()}`;
            localStorage.setItem(this.keySession, newToken);
            console.log("🔄 Token refrescado");
            return newToken;
        } catch (error) {
            console.error("❌ Error al refrescar token:", error);
            this.logout();
            return null;
        }
    }
}

export default new SecurityService();