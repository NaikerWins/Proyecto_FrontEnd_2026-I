import React, { useEffect, useState } from 'react';
import { Card, Spinner, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DigitalSignatureService } from '../../services/digitalSignatureService';
import { DigitalSignature } from '../../models/DigitalSignature';
import api from '../../interceptors/axiosInterceptor';

const DigitalSignatureList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [signature, setSignature] = useState<DigitalSignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        if (userId) {
          const data = await DigitalSignatureService.getByUserId(
            Number(userId),
          );
          if (!data) {
            // Si el usuario no tiene firma, redirigimos a crear
            navigate(`/digital-signature/${userId}/crear`);
            return;
          }
          if (!data.user && data.user_id) {
            try {
              const userResponse = await api.get(`/users/${data.user_id}`);
              const userData = userResponse.data;
              data.user = userData;
            } catch (err) {
              console.error('Error fetching user info:', err);
            }
          }
          setSignature(data);
        }
      } catch (error: any) {
        // Si el backend devuelve 404 → el usuario no tiene firma todavía
        if (error.response && error.response.status === 404) {
          navigate(`/digital-signature/${userId}/crear`);
        } else {
          console.error('Error fetching signature:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSignature();
  }, [userId, navigate]);

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">
        {signature?.user?.name
          ? `${signature.user.name} - Signature`
          : 'Signature'}
      </h3>

      {signature ? (
        <Card className="p-6 shadow-sm">
          {/* contenedor principal (fila) */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-8">
            {/* Imagen de la firma (ancho fijo) */}
            <div className="flex justify-center items-center border border-gray-300 rounded-md overflow-hidden w-[360px]">
              <img
                src={`${api.defaults.baseURL}/${signature.photo}`}
                alt="Digital Signature"
                className="object-contain w-full h-auto"
              />
            </div>

            {/* Datos del usuario (columna derecha centrada verticalmente) */}
            <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 md:items-center md:text-left">
              <div>
                <h5 className="text-lg font-semibold mb-1">
                  Name: {signature.user?.name}
                </h5>
                <p className="text-lg font-semibold mb-1">
                  Email: {signature.user?.email}
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full md:w-auto"
                onClick={() =>
                  navigate(
                    `/digital-signature/${userId}/editar/${signature.id}`,
                  )
                }
              >
                Update Signature
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-center">No signature form.</p>
      )}
    </div>
  );
};

export default DigitalSignatureList;
