import { jwtDecode } from "jwt-decode";
import type { User } from "../models/User";

export type JwtRoleClaims = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  roleName?: string;
};

export function mergeUserRoleFromToken(
  user: User | undefined,
  token: string
): User | undefined {
  if (!user || !token) return user;
  try {
    const claims = jwtDecode<JwtRoleClaims>(token);
    const role = claims.role ?? claims.roleName;
    if (!role) return user;
    return { ...user, role };
  } catch {
    return user;
  }
}
