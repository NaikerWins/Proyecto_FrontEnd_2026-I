import React, { createContext, useContext } from 'react';
import { useMensajeria, MensajeRecibido } from '../hooks/useMensajeria';

interface MensajeriaContextType {
    mensajesNuevos: MensajeRecibido[];
    alertas: MensajeRecibido[];
    unirseGrupo: (grupoId: number) => void;
    salirGrupo: (grupoId: number) => void;
    limpiarMensajesNuevos: () => void;
}

const MensajeriaContext = createContext<MensajeriaContextType | null>(null);

export const MensajeriaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const mensajeria = useMensajeria();
    return (
        <MensajeriaContext.Provider value={mensajeria}>
            {children}
        </MensajeriaContext.Provider>
    );
};

export const useMensajeriaContext = () => {
    const context = useContext(MensajeriaContext);
    if (!context) throw new Error('useMensajeriaContext debe usarse dentro de MensajeriaProvider');
    return context;
};