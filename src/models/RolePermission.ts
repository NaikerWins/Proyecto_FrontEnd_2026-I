export interface RolePermission {
    id: string;
    role: { id: string; name: string; description: string } | null;
    permission: { id: string; url: string; method: string; module: string; type: string } | null;
    startAt: string | null;
    endAt: string | null;
}