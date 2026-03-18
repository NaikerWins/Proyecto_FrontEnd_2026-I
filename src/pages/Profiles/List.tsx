import React, { useEffect, useState } from "react";
import { profileService } from "../../services/profileService";
import ProfileMolecule from "../../components/Generics/ProfileMolecule";
import { Profile } from "../../models/Profile";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListProfiles: React.FC = () => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🔹 Cargar los perfiles al montar el componente
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const data = await profileService.getAllProfiles();
                setProfiles(data || []);
            } catch (error) {
                console.error("Error al obtener perfiles:", error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudieron cargar los perfiles.",
                    icon: "error",
                    timer: 2500,
                    showConfirmButton: false,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg font-semibold animate-pulse">
                    Cargando perfiles...
                </p>
            </div>
        );
    }

    // 🔹 Actualizar perfil (pendiente de implementar)
    const updateProfile = () => {
        navigate('/profiles/update');
    }

    // 🔹 Eliminar perfil y actualizar vista
    const deleteProfile = async (profile: Profile) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });

        if (!confirm.isConfirmed) return;

        try {
            const deleted = await profileService.deleteProfile(profile.id);
            if (deleted) {
                // 🟢 Eliminar del estado local
                setProfiles((prev) =>
                    prev.filter((p) => p.id !== profile.id)
                );

                Swal.fire({
                    title: "✅ Completado",
                    text: "El perfil se ha eliminado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error eliminando perfil:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el perfil",
                icon: "error",
                timer: 2500,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
            <div className="w-full max-w-5xl">
                <ProfileMolecule
                    profiles={profiles}
                    updateProfile={updateProfile}
                    deleteProfile={deleteProfile}
                />
            </div>
            <a href="http://localhost:5173/profiles/create">
                <button className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg hover:from-red-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-orange-300">Crear nuevo perfil</button>
            </a>
        </div>
    );
};

export default ListProfiles;
