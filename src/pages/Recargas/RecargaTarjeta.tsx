import { useState, useEffect } from 'react';
import { mpcService } from '../../services/metodoPagoCiudadanoService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const RecargaTarjeta = () => {
    const user = useSelector((s: RootState) => s.user.user);

    const [mpc, setMpc] = useState<any>(null);
    const [monto, setMonto] = useState(0);

    const cargo = monto > 0 ? monto * 0.029 + 900 : 0;
    const saldoDespues =
        monto > 0
            ? (mpc?.saldo ?? 0) + monto
            : (mpc?.saldo ?? 0);

    useEffect(() => {
        const cargarMpc = async () => {
            try {
                if (!user?.id) return;

                const response = await mpcService.getMpcById(user.id);
                setMpc(response);
            } catch (error) {
                console.error('Error cargando método de pago:', error);
            }
        };

        cargarMpc();
    }, [user]);

    const handleIniciarRecarga = async () => {
        try {
            if (!mpc?.id || monto <= 0 || !user?.email) return;
            const response = await mpcService.iniciarRecarga(
                mpc.id,
                monto,
                user.email
            );

            // Redirigir a ePayco
            const url = `https://checkout.epayco.co/payment.html?` +
                `amount=${response.monto}` +
                `&reference=${response.referencia}` +
                `&description=${encodeURIComponent(response.descripcion)}` +
                `&email=${encodeURIComponent(response.email)}`;
            window.location.href = url;
        } catch (error) {
            console.error('Error iniciando recarga:', error);
        }
    };

    return (
        <div>
            {/* mostrar saldo actual */}
            <h3>Saldo actual: ${mpc?.saldo ?? 0}</h3>

            {/* botones de montos predefinidos */}
            <div>
                {[10000, 20000, 50000, 100000].map((valor) => (
                    <button
                        key={valor}
                        onClick={() => setMonto(valor)}
                    >
                        ${valor.toLocaleString()}
                    </button>
                ))}
            </div>

            {/* input de monto personalizado */}
            <div>
                <input
                    type="number"
                    placeholder="Ingrese monto"
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                />
            </div>

            {/* mostrar cargo y saldo después */}
            <div>
                <p>Cargo: ${cargo.toFixed(0)}</p>
                <p>Saldo después: ${saldoDespues.toLocaleString()}</p>
            </div>

            {/* botón continuar al pago */}
            <button
                onClick={handleIniciarRecarga}
                disabled={monto <= 0}
            >
                Continuar al pago
            </button>
        </div>
    );
};

export default RecargaTarjeta;