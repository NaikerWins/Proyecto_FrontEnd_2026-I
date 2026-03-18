import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import { securityQuestionService } from "../../services/securityQuestionService";

const SecurityQuestionForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<SecurityQuestion>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const data = await securityQuestionService.getById(Number(id));
          setQuestion(data);
        } catch (error) {
          console.error("Error loading question:", error);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await securityQuestionService.update(Number(id), question);
      } else {
        await securityQuestionService.create(question);
      }
      navigate("/security-questions");
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>{id ? "Editar Pregunta de Seguridad" : "Crear Pregunta de Seguridad"}</h3>
      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={question.name}
            onChange={(e) => setQuestion({ ...question, name: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={question.description}
            onChange={(e) =>
              setQuestion({ ...question, description: e.target.value })
            }
            required
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Guardar"}
        </Button>

        <Button
          variant="secondary"
          className="ms-3"
          onClick={() => navigate("/security-questions")}
        >
          Cancelar
        </Button>
      </Form>
    </div>
  );
};

export default SecurityQuestionForm;
