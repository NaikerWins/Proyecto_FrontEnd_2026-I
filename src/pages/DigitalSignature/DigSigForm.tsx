import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DigitalSignatureService } from "../../services/digitalSignatureService";
import { DigitalSignature } from "../../models/DigitalSignature";

const DigitalSignatureForm: React.FC = () => {
  const { userId, id } = useParams<{ userId: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreating = location.pathname.includes("crear");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<DigitalSignature | null>(null);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        if (!isCreating && id) {
          const data = await DigitalSignatureService.getByUserId(Number(userId));
          setSignature(data);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };
    fetchSignature();
  }, [isCreating, id, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Por favor seleccione una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setLoading(true);

      if (isCreating) {
        await DigitalSignatureService.create(Number(userId), formData);
        setMessage("Firma creada correctamente!");
      } else if (id) {
        await DigitalSignatureService.update(Number(id), formData);
        setMessage("Firma actualizada correctamente!");
      }

      setTimeout(() => navigate(`/digital-signature/${userId}`), 1500);
    } catch (error) {
      console.error("Error guardando la firma:", error);
      setMessage("Error al guardar la firma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>
        {signature?.user?.name
          ? `${signature.user.name} - Signature`
          : "Digital Signature"}
      </h3>

      <Form onSubmit={handleSubmit} className="mt-3 text-center">
        <Form.Group controlId="photo">
          <Form.Label>Photo:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </Form.Group>

        <Button type="submit" className="mt-3" disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : isCreating ? (
            "Crear"
          ) : (
            "Actualizar"
          )}
        </Button>
      </Form>

      {message && (
        <Alert variant="info" className="mt-3 text-center">
          {message}
        </Alert>
      )}
    </div>
  );
};

export default DigitalSignatureForm;
