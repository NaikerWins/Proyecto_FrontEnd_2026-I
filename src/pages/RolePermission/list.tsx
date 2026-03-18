import React, { useEffect, useState } from "react";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { RolePermission } from "../../models/RolePermission";
import { roleService } from "../../services/roleService";
import PermissionService from "../../services/permissionService";
import RolePermissionService from "../../services/rolePermissionService";
import Swal from "sweetalert2";

const RolePermissionPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData, rpData] = await Promise.all([
                roleService.getRoles(),
                PermissionService.getAllPermissions(),
                RolePermissionService.getAll(),
            ]);
            setRoles(rolesData || []);
            setPermissions(permissionsData || []);
            setRolePermissions(rpData || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const findRolePermission = (roleId: string, permissionId: string) =>
        rolePermissions.find(
            (rp) => rp.role?.id === roleId && rp.permission?.id === permissionId
        );

    const isAssigned = (roleId: string, permissionId: string) =>
        !!findRolePermission(roleId, permissionId);

    const handleToggle = async (roleId: string, permissionId: string) => {
        const key = `${roleId}-${permissionId}`;
        setSaving(key);

        const existing = findRolePermission(roleId, permissionId);

        if (existing) {
            // Si el ID es temporal aún no existe en el backend — solo quita del estado local
            if (existing.id.startsWith('temp-')) {
                setRolePermissions(prev => prev.filter(rp => rp.id !== existing.id));
                setSaving(null);
                return;
            }

            const success = await RolePermissionService.remove(existing.id);
            if (success) {
                setRolePermissions(prev => prev.filter(rp => rp.id !== existing.id));
            } else {
                Swal.fire({ title: "Error", text: "No se pudo quitar el permiso", icon: "error", timer: 2000 });
            }
        } else {
            const success = await RolePermissionService.assign(roleId, permissionId);
            if (success) {
                const role = roles.find(r => String(r.id) === roleId);
                const permission = permissions.find(p => String(p.id) === permissionId);

                const newRolePermission: RolePermission = {
                    id: `temp-${roleId}-${permissionId}`,
                    role: role ? { id: String(role.id), name: role.name, description: role.description || '' } : null,
                    permission: permission ? {
                        id: String(permission.id),
                        url: permission.url,
                        method: permission.method,
                        module: permission.module || '',
                        type: permission.type || ''
                    } : null,
                    startAt: null,
                    endAt: null,
                };

                setRolePermissions(prev => [...prev, newRolePermission]);
            } else {
                Swal.fire({ title: "Error", text: "No se pudo asignar el permiso", icon: "error", timer: 2000 });
            }
        }

        setSaving(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 text-lg animate-pulse">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Gestión de Roles y Permisos
            </h1>
            <p className="text-sm text-gray-500 mb-6">
                Marca o desmarca para asignar o quitar permisos a cada rol.
            </p>

            <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 border-b text-gray-900">
                        <tr>
                            <th className="px-4 py-3 font-semibold sticky left-0 bg-gray-100 z-10 min-w-[160px]">
                                Rol
                            </th>
                            {permissions.map((perm) => (
                                <th key={perm.id} className="px-3 py-3 text-center font-medium text-xs min-w-[100px]">
                                    <div className="text-gray-800 font-mono">{perm.method}</div>
                                    <div className="text-gray-500 text-xs truncate max-w-[100px]" title={perm.url}>
                                        {perm.url}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white z-10">
                                    {role.name}
                                </td>
                                {permissions.map((perm) => {
                                    const assigned = isAssigned(String(role.id), String(perm.id));
                                    const key = `${role.id}-${perm.id}`;
                                    const isSaving = saving === key;

                                    return (
                                        <td key={perm.id} className="px-3 py-3 text-center">
                                            {isSaving ? (
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={assigned}
                                                    onChange={() => handleToggle(String(role.id), String(perm.id))}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RolePermissionPage;