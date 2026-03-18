import React from "react";
import { Profile } from "../../models/Profile";

interface ProfileMoleculeProps {
    profiles?: any[] | null;
    deleteProfile?: (values: Profile) => void;
    updateProfile?: () => void;
}

const ProfileMolecule: React.FC<ProfileMoleculeProps> = ({
    profiles,
    deleteProfile,
    updateProfile,
}) => {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-300">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
                Lista de Perfiles
            </h2>

            {profiles && profiles.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-300">
                    <tbody className="bg-white divide-y divide-gray-200">
                        {profiles.map((p) => {
                            const formattedProfile: Profile = {
                                id: p.id,
                                phone: p.phone,
                                photoURL: null,
                            };

                            const photoPath = p.photo
                                ? `${import.meta.env.VITE_API_URL}/${p.photo}`
                                : null;

                            return (
                                <tr
                                    key={formattedProfile.id}
                                    className="hover:bg-gray-50 transition-all duration-200"
                                >
                                    {/* 📸 Foto y datos */}
                                    <td className="px-6 py-4 flex items-center gap-5">
                                        {photoPath ? (
                                            <img
                                                src={photoPath}
                                                alt="Foto de perfil"
                                                className="h-16 w-16 rounded-full object-cover border-4 border-indigo-700 shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 border-2 border-gray-400">
                                                Sin foto
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-gray-900 font-bold text-base">
                                                ID: {formattedProfile.id}
                                            </p>
                                            <p className="text-gray-700 text-sm">
                                                Teléfono:{" "}
                                                {formattedProfile.phone || "No registrado"}
                                            </p>
                                            <p className="text-gray-500 text-xs italic">
                                                User ID: {p.user_id}
                                            </p>
                                        </div>
                                    </td>

                                    {/* 🔘 Botones */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={() =>
                                                    updateProfile && updateProfile()
                                                }
                                                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-indigo-700 hover:bg-indigo-800 text-yellow-200 border-2 border-indigo-900 shadow-lg hover:shadow-2xl transition-transform duration-200 transform hover:scale-105"
                                            >
                                                Actualizar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteProfile &&
                                                    deleteProfile(formattedProfile)
                                                }
                                                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-700 hover:bg-red-800 text-yellow-100 border-2 border-red-900 shadow-lg hover:shadow-2xl transition-transform duration-200 transform hover:scale-105"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-600 py-6 font-semibold">
                    No hay perfiles para mostrar.
                </p>
            )}
        </div>
    );
};

export default ProfileMolecule;
