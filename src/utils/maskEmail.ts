/**
 * Formato tipo [xx***@***.com] para mostrar correo sin exponerlo completo.
 */
export function maskEmailForDisplay(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0 || at === trimmed.length - 1) {
    return "[***@***.com]";
  }
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const localMasked =
    local.length <= 2 ? `${local.charAt(0)}***` : `${local.slice(0, 2)}***`;
  const lastDot = domain.lastIndexOf(".");
  const tld = lastDot >= 0 ? domain.slice(lastDot) : "";
  const domainMasked = tld ? `***${tld}` : "***";
  return `[${localMasked}@${domainMasked}]`;
}
