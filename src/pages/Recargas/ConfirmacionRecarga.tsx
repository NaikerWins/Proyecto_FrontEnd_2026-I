import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mpcService } from '../../services/metodoPagoCiudadanoService';

const ConfirmacionRecarga = () => {
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const confirmarPago = async () => {
            try {
                // Parámetros enviados por ePayco
                const refPayco = searchParams.get('ref_payco');
                //const transactionId = searchParams.get('x_transaction_id');
                const transactionState = searchParams.get('x_cod_transaction_state');

                if (!refPayco) {
                    setMensaje('Referencia de pago no encontrada');
                    setLoading(false);
                    return;
                }

                // Confirmar recarga en backend
                await mpcService.confirmarRecarga(
                    refPayco,
                    transactionState ?? '',
                    Number(searchParams.get('x_amount') ?? 0)
                );

                setSuccess(true);
                setMensaje('La recarga fue confirmada correctamente');
            } catch (error) {
                console.error('Error confirmando recarga:', error);

                setSuccess(false);
                setMensaje('Ocurrió un error confirmando la recarga');
            } finally {
                setLoading(false);
            }
        };

        confirmarPago();
    }, [searchParams]);

    if (loading) {
        return <div>Confirmando pago...</div>;
    }

    return (
        <div>
            <h2>
                {success
                    ? '✅ Recarga exitosa'
                    : '❌ Error en la recarga'}
            </h2>

            <p>{mensaje}</p>
        </div>
    );
};

export default ConfirmacionRecarga;