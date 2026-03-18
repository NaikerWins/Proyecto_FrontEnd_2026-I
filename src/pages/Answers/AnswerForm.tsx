import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { answerService } from "../../services/answerService";
import api from "../../interceptors/axiosInterceptor";
import Swal from "sweetalert2";

const AnswerForm: React.FC = () => {
  const { userId, id } = useParams<{ userId: string; id?: string }>();
  const [questions, setQuestions] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    securityQuestionId: "",
    content: "",
  });
  const navigate = useNavigate();

  // 🔹 Cargar todas las preguntas al iniciar
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await api.get("/security-questions");
      setQuestions(response.data);
    };
    fetchQuestions();
  }, []);

  // 🔹 Si estamos en modo edición, cargar los datos actuales
  useEffect(() => {
    const fetchAnswer = async () => {
      if (id) {
        try {
          const { data } = await api.get(`/answers/${id}`);
          setFormData({
            securityQuestionId: data.security_question_id.toString(),
            content: data.content,
          });
        } catch (error) {
          console.error("Error fetching answer:", error);
          Swal.fire("Error", "No se pudo cargar la respuesta.", "error");
        }
      }
    };
    fetchAnswer();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        // 🔹 Actualizar respuesta existente
        await answerService.update(Number(id), formData.content);
        Swal.fire("Actualizado", "Respuesta actualizada correctamente", "success");
      } else {
        // 🔹 Crear nueva respuesta
        await answerService.create(
          Number(userId),
          Number(formData.securityQuestionId),
          formData.content
        );
        Swal.fire("Creado", "Respuesta creada correctamente", "success");
      }
      navigate(`/answers/${userId}`);
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar la respuesta", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h3>{id ? "Editar" : "Crear"} Respuesta</h3>

      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Pregunta de seguridad</Form.Label>
          <Form.Select
            value={formData.securityQuestionId}
            disabled={!!id} // ✅ bloqueamos el cambio si estamos editando
            onChange={(e) =>
              setFormData({
                ...formData,
                securityQuestionId: e.target.value,
              })
            }
          >
            <option value="">Seleccione una pregunta</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Respuesta</Form.Label>
          <Form.Control
            type="text"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Escribe tu respuesta"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {id ? "Actualizar" : "Guardar"}
        </Button>
      </Form>
    </div>
  );
};

export default AnswerForm;
