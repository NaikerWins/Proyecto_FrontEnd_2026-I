import { Profile } from "../../models/Profile";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import { profileService } from "../../services/profileService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const UpdateProfile: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // 🔹 Hook para navegación

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

    const handleUpdateProfile = async (profile: Profile) => {
        try {
            const formData = new FormData();
            formData.append("phone", profile.phone);
            if (profile.photoURL instanceof File) {
                formData.append("photo", profile.photoURL);
            }

            const updatedProfile = await profileService.updateProfile(profile.id, formData);

            if (updatedProfile) {
                Swal.fire({
                    title: "✅ Actualizado",
                    text: "El perfil se ha actualizado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });

                // 🔹 Redirigir a la lista de perfiles
                navigate("/profiles/list");

            } else {
                Swal.fire({
                    title: "❌ Error",
                    text: "Hubo un problema al actualizar el perfil",
                    icon: "error",
                    timer: 2500,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo conectar con el servidor",
                icon: "error",
                timer: 2500,
                showConfirmButton: false,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg font-semibold animate-pulse">
                    Cargando perfiles...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                Actualizar Perfil
            </h2>

            <Formik
                initialValues={{
                    id: "",
                    phone: "",
                    photoURL: null,
                }}
                validationSchema={Yup.object({
                    id: Yup.number()
                        .typeError("Debe seleccionar un perfil")
                        .required("El perfil es obligatorio"),
                    phone: Yup.string()
                        .required("El teléfono es obligatorio")
                        .matches(/^\d{10}$/, "El teléfono debe tener 10 dígitos"),
                    photoURL: Yup.mixed().nullable(),
                })}
                onSubmit={(values, { resetForm }) => {
                    const formattedProfile: Profile = {
                        id: Number(values.id),
                        phone: values.phone,
                        photoURL: values.photoURL,
                    };
                    handleUpdateProfile(formattedProfile);
                    resetForm();
                }}
            >
                {({ setFieldValue, values }) => (
                    <Form className="space-y-5">
                        {/* Selector de Perfil */}
                        <div>
                            <label
                                htmlFor="id"
                                className="block font-semibold mb-1 text-gray-700"
                            >
                                Perfil
                            </label>

                            <select
                                id="id"
                                name="id"
                                value={values.id}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setFieldValue("id", selectedId);
                                    const selectedProfile = profiles.find(
                                        (p) => p.id === Number(selectedId)
                                    );
                                    if (selectedProfile) {
                                        setFieldValue("phone", selectedProfile.phone || "");
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            >
                                <option value="">Seleccione un perfil</option>
                                {profiles.map((profile) => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.id} - {profile.phone}
                                    </option>
                                ))}
                            </select>

                            <ErrorMessage
                                name="id"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Campo Teléfono */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block font-semibold mb-1 text-gray-700"
                            >
                                Teléfono
                            </label>
                            <Field
                                type="text"
                                name="phone"
                                placeholder="Ej: 3124567890"
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            />
                            <ErrorMessage
                                name="phone"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Campo Foto */}
                        <div>
                            <label
                                htmlFor="photoURL"
                                className="block font-semibold mb-1 text-gray-700"
                            >
                                Foto del perfil
                            </label>
                            <input
                                id="photoURL"
                                name="photoURL"
                                type="file"
                                accept="image/*"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = event.currentTarget.files?.[0] || null;
                                    setFieldValue("photoURL", file);
                                }}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            />
                            <ErrorMessage
                                name="photoURL"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Botón Actualizar */}
                        {/* Botón Actualizar */}
                        <div className="text-center mt-6">
                            <button
                                type="submit"
                                className="
                                    w-full
                                    bg-green-800
                                    text-yellow-300
                                    font-extrabold
                                    text-lg
                                    py-3
                                    rounded-xl
                                    shadow-lg
                                    hover:bg-yellow-400
                                    hover:text-green-900
                                    hover:shadow-2xl
                                    transition-all
                                    duration-300
                                    transform
                                    hover:scale-105
                                "
                            >
                                Actualizar Perfil
                            </button>
                        </div>

                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UpdateProfile;
