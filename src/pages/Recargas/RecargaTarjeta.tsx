import { useState, useEffect } from 'react';
import { mpcService } from '../../services/metodoPagoCiudadanoService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const MONTOS_PREDEFINIDOS = [10000, 20000, 50000, 100000];

const RecargaTarjeta = () => {
    const user = useSelector((s: RootState) => s.user.user);
    const [mpc, setMpc] = useState<any>(null);
    const [monto, setMonto] = useState(0);
    const [montoPersonalizado, setMontoPersonalizado] = useState('');
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);

    const cargo = monto > 0 ? Math.round(monto * 0.029 + 900) : 0;
    const saldoDespues = (mpc?.saldo ?? 0) + monto;

    useEffect(() => {
        const cargarMpc = async () => {
            try {
                if (!user?.id) return;
                const response = await mpcService.getMpcByCiudadano(user.id);
                setMpc(response[0]); // toma el primero
            } catch (error) {
                console.error('Error cargando método de pago:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarMpc();
    }, [user]);

    const seleccionarMonto = (valor: number) => {
        setMonto(valor);
        setMontoPersonalizado('');
    };

    const handleMontoPersonalizado = (valor: string) => {
        setMontoPersonalizado(valor);
        setMonto(Number(valor));
    };

    const handleIniciarRecarga = async () => {
        if (!mpc?.id || monto <= 0 || !user?.email) return;
        setProcesando(true);
        try {
            const response = await mpcService.iniciarRecarga(mpc.id, monto, user!.email!);
            const url = `https://checkout.epayco.co/payment.html` +
                `?key=8c446a5d7c865bcf65be68429bf52e7e` +
                `&amount=${response.monto}` +
                `&reference=${response.referencia}` +
                `&description=${encodeURIComponent(response.descripcion)}` +
                `&email=${encodeURIComponent(response.email)}` +
                `&response=${encodeURIComponent('http://localhost:5173/recargas/confirmacion')}` +
                `&confirmation=${encodeURIComponent('http://localhost:3000/metodospagociudadano/confirmar-recarga')}`;
            window.location.href = url;
        } catch (error) {
            console.error('Error iniciando recarga:', error);
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="mb-6">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">Recargar Tarjeta</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Recarga tu tarjeta de transporte de forma segura con ePayco
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Panel principal */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Saldo actual */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo actual</p>
                                <p className="text-4xl font-bold text-black dark:text-white mt-1">
                                    ${(mpc?.saldo ?? 0).toLocaleString('es-CO')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Método: {mpc?.metodopago?.tipo ?? 'No definido'}
                                </p>
                            </div>
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Selección de monto */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">Selecciona el monto a recargar</h3>
                        </div>
                        <div className="p-6">
                            {/* Montos predefinidos */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
                                {MONTOS_PREDEFINIDOS.map((valor) => (
                                    <button
                                        key={valor}
                                        onClick={() => seleccionarMonto(valor)}
                                        className={`rounded-md border-2 py-3 px-4 font-medium transition-all ${
                                            monto === valor && !montoPersonalizado
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-stroke text-black hover:border-primary dark:border-strokedark dark:text-white'
                                        }`}
                                    >
                                        ${valor.toLocaleString('es-CO')}
                                    </button>
                                ))}
                            </div>

                            {/* Monto personalizado */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    O ingresa un monto personalizado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={montoPersonalizado}
                                        onChange={(e) => handleMontoPersonalizado(e.target.value)}
                                        placeholder="5,000 - 500,000"
                                        min={5000}
                                        max={500000}
                                        className="w-full rounded border border-stroke bg-transparent pl-8 pr-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Entre $5,000 y $500,000</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                <div className="space-y-4">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
                        <h4 className="font-medium text-black dark:text-white mb-4">Resumen de recarga</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Saldo actual</span>
                                <span className="font-medium text-black dark:text-white">
                                    ${(mpc?.saldo ?? 0).toLocaleString('es-CO')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Monto a recargar</span>
                                <span className="font-medium text-black dark:text-white">
                                    ${monto.toLocaleString('es-CO')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Comisión ePayco</span>
                                <span className="font-medium text-meta-1">
                                    +${cargo.toLocaleString('es-CO')}
                                </span>
                            </div>
                            <div className="border-t border-stroke pt-3 dark:border-strokedark">
                                <div className="flex justify-between">
                                    <span className="font-medium text-black dark:text-white">Saldo después</span>
                                    <span className="font-bold text-meta-3 text-lg">
                                        ${saldoDespues.toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleIniciarRecarga}
                            disabled={monto <= 0 || procesando}
                            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {procesando ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            )}
                            Continuar al pago
                        </button>

                        <p className="mt-3 text-xs text-center text-gray-400">
                            🔒 Pago seguro procesado por ePayco
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecargaTarjeta;
