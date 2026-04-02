/**
 * Debe coincidir con los nombres de rol en el backend (UserRole / Role).
 */
export const ADMINISTRATION_ROLE_NAMES = [
  'Administrador Sistema',
  'Administrador Empresa',
  'Supervisor',
] as const;

/** CSV de nombres de rol tal como viene en JWT / usuario (login). */
export function hasAdministrationAccess(
  roleCsv: string | undefined | null,
): boolean {
  if (!roleCsv?.trim()) return false;
  const roles = roleCsv.split(',').map((s) => s.trim().toLowerCase());
  return ADMINISTRATION_ROLE_NAMES.some((n) =>
    roles.includes(n.toLowerCase()),
  );
}
