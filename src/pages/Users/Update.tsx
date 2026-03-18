
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { userService } from "../../services/userService";
import Swal from "sweetalert2";

import { User } from '../../models/User';
import UserFormValidator from '../../components/UserFormValidator';
import Breadcrumb from "../../components/Breadcrumb";

const UpdateUser: React.FC = () => {
    const { id } = useParams(); // Obtener el ID de la URL
    
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    // Cargar datos del usuario después del montaje
    useEffect(() => {
        console.log("Id->"+id)
        const fetchUser = async () => {
            if (!id) return; // Evitar errores si el ID no está disponible
            const userData = await userService.getUserById(id);
            setUser(userData);
        };

        fetchUser();
    }, [id]);

    const handleUpdateUser = async (theUser: User) => {
        try {
            const updatedUser = await userService.updateUser(theUser.id || "", theUser);
            if (updatedUser) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha actualizado correctamente el registro",
                    icon: "success",
                    timer: 3000
                });
                navigate("/users"); // Redirección en React Router
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de actualizar el registro",
                    icon: "error",
                    timer: 3000
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de actualizar el registro",
                icon: "error",
                timer: 3000
            });
        }
    };

    if (!user) {
        return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se obtienen los datos
    }

    return (
        <>
            <Breadcrumb pageName="Actualizar Usuario" />
            <UserFormValidator
                handleUpdate={handleUpdateUser}
                mode={2} // 2 significa actualización
                user={user}
            />
        </>
    );
};

export default UpdateUser;