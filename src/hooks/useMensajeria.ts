import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface MensajeRecibido {
    id: number;
    emisorId: string;
    emisorNombre: string;
    contenido: string;
    fechaEnvio: string;
    tipo: 'directo' | 'grupo' | 'masivo';
    grupoId?: number;
    grupoNombre?: string;
    leido?: boolean;
}

const NEST_URL = import.meta.env.VITE_NEST_URL || 'http://localhost:3000';

export const useMensajeria = () => {
    const [mensajesNuevos, setMensajesNuevos] = useState<MensajeRecibido[]>([]);
    const [alertas, setAlertas] = useState<MensajeRecibido[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.id;
        if (!userId) return;

        // Conectar al WebSocket
        socketRef.current = io(`${NEST_URL}/mensajeria`, {
            query: { userId },
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('Conectado a mensajería WebSocket');
        });

        // Escuchar mensajes directos
        socketRef.current.on('mensaje_directo', (mensaje: MensajeRecibido) => {
            setMensajesNuevos((prev) => [mensaje, ...prev]);
        });

        // Escuchar mensajes de grupo
        socketRef.current.on('mensaje_grupo', (mensaje: MensajeRecibido) => {
            setMensajesNuevos((prev) => [mensaje, ...prev]);
        });

        // Escuchar alertas masivas
        socketRef.current.on('alerta_masiva', (alerta: MensajeRecibido) => {
            setAlertas((prev) => [alerta, ...prev]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const unirseGrupo = (grupoId: number) => {
        socketRef.current?.emit('unirse_grupo', { grupoId });
    };

    const salirGrupo = (grupoId: number) => {
        socketRef.current?.emit('salir_grupo', { grupoId });
    };

    const limpiarMensajesNuevos = () => setMensajesNuevos([]);

    return {
        mensajesNuevos,
        alertas,
        unirseGrupo,
        salirGrupo,
        limpiarMensajesNuevos,
        socket: socketRef.current,
    };
};