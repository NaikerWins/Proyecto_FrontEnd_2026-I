import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    age: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const newUser = await userService.createUser({
        name: `${formData.name} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        age: Number(formData.age),
      });

      if (newUser) {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false,
        });
        navigate('/auth/signin');
      } else {
        setError(
          'No se pudo crear la cuenta. El email puede ya estar registrado.',
        );
      }
    } catch (error: any) {
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasLower: /[a-z]/.test(formData.password),
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  };

  const getPasswordStrength = () => {
    const checks = Object.values(passwordChecks).filter(Boolean).length;

    if (checks <= 2) return { label: 'Débil', value: 33 };
    if (checks <= 4) return { label: 'Media', value: 66 };
    return { label: 'Fuerte', value: 100 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Crear cuenta
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sistema de Buses Inteligentes
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Juan"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Ej: Pérez"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="text-sm mt-2 space-y-1">
              <p
                className={
                  passwordChecks.hasUpper ? 'text-green-600' : 'text-gray-500'
                }
              >
                {passwordChecks.hasUpper ? '✔' : '✖'} Una mayúscula
              </p>
              <p
                className={
                  passwordChecks.hasLower ? 'text-green-600' : 'text-gray-500'
                }
              >
                {passwordChecks.hasLower ? '✔' : '✖'} Una minúscula
              </p>
              <p
                className={
                  passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'
                }
              >
                {passwordChecks.hasNumber ? '✔' : '✖'} Un número
              </p>
              <p
                className={
                  passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-500'
                }
              >
                {passwordChecks.hasSpecial ? '✔' : '✖'} Un carácter especial
              </p>
              <p
                className={
                  passwordChecks.minLength ? 'text-green-600' : 'text-gray-500'
                }
              >
                {passwordChecks.minLength ? '✔' : '✖'} Mínimo 8 caracteres
              </p>
            </div>

            <div className="mt-3">
              <p
                className={`text-xs mt-1 font-semibold ${
                  strength.label === 'Fuerte'
                    ? 'text-green-600'
                    : strength.label === 'Media'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                Seguridad: {strength.label}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="3001234567"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="22"
                min="1"
                max="120"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ej: Manizales"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/auth/signin"
              className="text-blue-600 font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
