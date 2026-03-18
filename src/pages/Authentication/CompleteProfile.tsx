import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumb';
import axios from 'axios'; // agrega este import arriba

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Recibe el usuario del estado de navegación
    const user = location.state?.user;
    const token = location.state?.token;
    const googleCredential = location.state?.googleCredential; 

    const [formData, setFormData] = useState({
        phone: '',
        city: '',
        age: '',
    });
    const [loading, setLoading] = useState(false);

    // Si no hay usuario en el estado, redirige al login
    if (!user) {
        navigate('/auth/signin');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.phone || !formData.city || !formData.age) {
        Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor completa todos los campos',
            icon: 'warning',
            timer: 2500,
        });
        setLoading(false);
        return;
    }

    try {
        // Llama directamente al endpoint de Google que está excluido del interceptor
        const response = await axios.post(
            'http://localhost:8081/security/login/google',
            {
                token: googleCredential,
                phone: formData.phone,
                city: formData.city,
                age: formData.age,
            }
        );

        console.log('📥 Respuesta del backend:', response.data);

        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('session', response.data.token);

            Swal.fire({
                title: 'Perfil completado',
                text: 'Bienvenido al sistema',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            navigate('/', { replace: true });
        }
    } catch (error) {
        console.error('❌ Error al completar perfil:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo completar el perfil',
            icon: 'error',
            timer: 2500,
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <Breadcrumb pageName="Completar Perfil" />

                {/* Foto y nombre del usuario de Google */}
                <div className="flex flex-col items-center mb-6">
                    {user.picture && (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-20 h-20 rounded-full mb-3 border-2 border-blue-400"
                        />
                    )}
                    <h2 className="text-xl font-bold text-gray-800">
                        Hola, {user.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Completa tu información para continuar
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email — solo lectura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 3001234567"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Manizales"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Edad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Edad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 22"
                            min="1"
                            max="120"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Completar registro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;