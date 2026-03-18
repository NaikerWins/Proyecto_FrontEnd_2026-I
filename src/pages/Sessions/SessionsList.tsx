import { Session } from '../../models/Sessions';
import { SessionService } from '../../services/sessionsService';
import GenericList from '../../components/Generics/GenericList';
import { useEffect, useState } from 'react';

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Obtener usuario logueado del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;

      if (!userId) {
        console.warn('⚠️ No hay usuario logueado, no se pueden cargar las sesiones.');
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