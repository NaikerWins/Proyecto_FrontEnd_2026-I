/**
 * Solo reCAPTCHA v3: `grecaptcha.execute(siteKey, { action })`.
 * No aplica a v2 (checkbox) ni a Enterprise (habría que usar `grecaptcha.enterprise` y el provider con useEnterprise).
 */
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

function getGrecaptcha(): Grecaptcha | undefined {
  if (typeof window === 'undefined') return undefined;
  const g = (window as Window & { grecaptcha?: Grecaptcha }).grecaptcha;
  return g?.execute && g?.ready ? g : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Ejecuta reCAPTCHA v3 con la API global (mismo contrato que el hook de Google).
 */
async function executeViaWindow(
  siteKey: string,
  action: string,
): Promise<string | undefined> {
  const g = getGrecaptcha();
  if (!g) return undefined;
  return new Promise((resolve) => {
    try {
      g.ready(() => {
        g.execute(siteKey, { action })
          .then((token) => resolve(token?.trim() || undefined))
          .catch(() => resolve(undefined));
      });
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Obtiene un token reCAPTCHA v3.
 * 1) Usa el hook (`executeRecaptcha`) cuando exista.
 * 2) Si no hay token, usa `grecaptcha.execute` en `window` (misma clave de sitio).
 *    Esto cubre casos donde el provider de React no asigna el callback a tiempo.
 */
export async function obtainRecaptchaToken(
  getExecute: () => ((action?: string) => Promise<string>) | undefined,
  action: string,
  siteKey?: string,
): Promise<string | undefined> {
  const sk = siteKey?.trim();
  const LOAD_WAIT_MS = 100;
  const LOAD_MAX_MS = 20000;
  const EXEC_RETRIES = 12;
  const EXEC_GAP_MS = 300;

  const deadline = Date.now() + LOAD_MAX_MS;

  while (Date.now() < deadline) {
    const exec = getExecute();
    const g = getGrecaptcha();
    if (exec || (sk && g)) {
      break;
    }
    await sleep(LOAD_WAIT_MS);
  }

  const runHook = async (): Promise<string | undefined> => {
    const exec = getExecute();
    if (!exec) return undefined;
    let lastErr: unknown;
    for (let i = 0; i < EXEC_RETRIES; i++) {
      if (i > 0) await sleep(EXEC_GAP_MS);
      try {
        const raw = await Promise.resolve(exec(action)).catch((e) => {
          lastErr = e;
          return undefined;
        });
        const t = raw != null ? String(raw).trim() : '';
        if (t) return t;
      } catch (e) {
        lastErr = e;
      }
    }
    if (import.meta.env.DEV && lastErr != null) {
      console.warn('[reCAPTCHA] execute (hook) sin token tras reintentos:', lastErr);
    }
    return undefined;
  };

  const fromHook = await runHook();
  if (fromHook) return fromHook;

  if (sk) {
    const fromWin = await executeViaWindow(sk, action);
    if (fromWin) return fromWin;
  }

  const lateHook = await runHook();
  if (lateHook) return lateHook;

  if (sk) {
    const fromWin2 = await executeViaWindow(sk, action);
    if (fromWin2) return fromWin2;
  }

  if (import.meta.env.DEV) {
    console.warn(
      '[reCAPTCHA] Sin token. Comprueba VITE_RECAPTCHA_SITE_KEY (v3), dominios en https://www.google.com/recaptcha/admin y extensiones que bloqueen gstatic/google.com.',
    );
  }
  return undefined;
}
