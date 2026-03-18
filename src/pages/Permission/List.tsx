import React, { useEffect, useState } from "react";
import GenericTable from "../../components/Generics/GenericList";
import PermissionService from "../../services/permissionService";
import { Permission } from "../../models/Permission";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const METHODS = ["GET", "POST", "PUT", "DELETE"];
const TYPES = ["READ", "WRITE", "EDIT", "DELETE"];

const emptyForm = { url: "", method: "GET", module: "", type: "READ", model: "" };

const ListPermissions: React.FC = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const data = await PermissionService.getAllPermissions();
            setPermissions(data || []);
        } catch (error) {
            Swal.fire({ title: "Error", text: "No se pudieron obtener los permisos", icon: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.url || !form.method || !form.module || !form.type || !form.model) {
            Swal.fire({ title: "Campos requeridos", text: "Por favor completa todos los campos", icon: "warning", timer: 2000 });
            return;
        }

        setSaving(true);
        try {
            const created = await PermissionService.createPermission(form);
            if (created) {
                Swal.fire({ title: "Creado", text: "Permiso creado correctamente", icon: "success", timer: 2000, showConfirmButton: false });
                setShowModal(false);
                setForm(emptyForm);
                fetchPermissions();
            } else {
                Swal.fire({ title: "Error", text: "No se pudo crear el permiso", icon: "error", timer: 2000 });
            }
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al crear el permiso", icon: "error", timer: 2000 });
        } finally {
            setSaving(false);
        }
    };

    const columns = ["id", "module", "type", "url", "method"];
    const columnNames = { id: "ID", module: "Módulo", type: "Tipo", url: "Ruta", method: "Método" };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-6">
            <div className="w-full max-w-6xl">

                {/* Botones superiores */}
                <div className="flex justify-end gap-3 mb-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                    >
                        + Crear Permiso
                    </button>
                    <button
                        onClick={() => navigate('/RolePermission/list')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                    >
                        Gestión de roles y permisos
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-600 text-lg text-center animate-pulse">Cargando permisos...</p>
                ) : (
                    <GenericTable
                        data={permissions}
                        columns={columns}
                        columnNames={columnNames}
                        actions={[]}
                        onAction={() => {}}
                        title="Listado de Permisos del Sistema"
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Crear Permiso</h2>
                            <button
                                onClick={() => { setShowModal(false); setForm(emptyForm); }}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="url"
                                    value={form.url}
                                    onChange={handleChange}
                                    placeholder="Ej: /users/?"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Método <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="method"
                                    value={form.method}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {METHODS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Module */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Módulo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="module"
                                    value={form.module}
                                    onChange={handleChange}
                                    placeholder="Ej: Gestión de usuarios"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    placeholder="Ej: User"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setForm(emptyForm); }}
                                    className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Guardando..." : "Crear Permiso"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListPermissions;