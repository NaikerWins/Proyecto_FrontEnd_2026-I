import { Session } from '../../models/Sessions';
import { SessionService } from '../../services/sessionsService';
import GenericList from '../../components/Generics/GenericList';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadSessions();
  }, [id]);

  const loadSessions = async () => {
    try {
      // Primero intenta con el ID de la URL
      let userId = id;

      // Si no hay ID en la URL, busca en localStorage
      if (!userId) {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') {
          console.warn('⚠️ No hay usuario logueado');
          return;
        }
        const user = JSON.parse(userStr);
        userId = user?.id;
      }

      if (!userId) {
        console.warn('⚠️ No se encontró userId');
        return;
      }

      console.log('🔍 Cargando sesiones del usuario ID:', userId);
      const response = await SessionService.getByUserId(userId);
      console.log('✅ Sesiones cargadas:', response.data);
      setSessions(response.data);

    } catch (error) {
      console.error('❌ Error loading sessions:', error);
    }
  };

  const columns = ['id', 'token', 'FACode', 'state', 'expiration'];
  const columnNames = {
    id: 'ID',
    token: 'Token',
    FACode: 'FACode',
    state: 'State',
    expiration: 'Expiration'
  };

  return (
    <GenericList
      title="Sessions"
      columns={columns}
      columnNames={columnNames}
      data={sessions}
      actions={[
        { name: 'view', label: 'View', color: 'info' },
        { name: 'delete', label: 'Delete', color: 'error' },
      ]}
      onAction={(name, item) => {
        if (name === 'view') {
          console.log('👁 Viewing session:', item);
        } else if (name === 'delete') {
          console.log('🗑 Deleting session:', item);
        }
      }}
    />
  );
}