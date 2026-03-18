import { Session } from '../../models/Sessions';
import { SessionService } from '../../services/sessionsService';
import GenericForm, {
  FormField,
} from '../../components/Generics/MUI/GenericForm';
import { useState } from 'react';

const SessionForm: React.FC = () => {
  const [formData] = useState<Partial<Session>>({
    token: '',
    FACode: '',
    state: 'active',
    expiration: '',
  });

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id; // o el id real del usuario logueado
      if (!userId) {
        console.warn('⚠️ No se encontró userId en localStorage');
        return;
      }
      await SessionService.create(userId, formData);
      console.log('Session created successfully');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // 🔧 Corrige los tipos aquí
  // ✅ Corrige los tipos aquí
  const fields: FormField[] = [
    { label: 'Token', name: 'token', type: 'text', required: true },
    { label: 'FACode', name: 'FACode', type: 'text' },
    {
      label: 'State',
      name: 'state',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    { label: 'Expiration', name: 'expiration', type: 'date' },
  ];

  return (
    <GenericForm
      title="Session Form"
      fields={fields}
      initialValues={formData}
      onSubmit={handleSubmit}
    />
  );
};

export default SessionForm;