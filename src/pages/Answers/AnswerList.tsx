import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Answer } from "../../models/Answer";
import { answerService } from "../../services/answerService";
import GenericTable from "../../components/Generics/GenericList";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../interceptors/axiosInterceptor";

const AnswerList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!userId) return;
    try {
      // 🔹 Obtenemos las respuestas del usuario
      const userAnswers = await answerService.getByUserId(Number(userId));

      // 🔹 Obtenemos todas las preguntas del catálogo
      const { data: allQuestions } = await api.get("/security-questions");

      // 🔹 Mezclamos respuestas con sus preguntas
      const merged = userAnswers.map((a: any) => {
        const question = allQuestions.find(
          (q: any) => q.id === a.security_question_id
        );
        return { ...a, question };
      });

      setAnswers(merged);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAction = async (name: string, item: Answer) => {
    if (name === "edit") {
      navigate(`/answers/${userId}/editar/${item.id}`);
    } else if (name === "delete" && item.id) {
      const confirm = await Swal.fire({
        title: "¿Eliminar respuesta?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });
      if (confirm.isConfirmed) {
        await answerService.delete(item.id);
        Swal.fire("Eliminado", "La respuesta ha sido eliminada", "success");
        fetchData();
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Respuestas de Seguridad</h3>
        <Button
          variant="success"
          onClick={() => navigate(`/answers/${userId}/crear`)}
        >
          Crear Respuesta
        </Button>
      </div>

      <GenericTable
        data={answers.map((a) => ({
          id: a.id,
          pregunta: a.question?.name || "—",
          respuesta: a.content,
        }))}
        columns={["id", "pregunta", "respuesta"]}
        actions={[
          { name: "edit", label: "Editar", color: "info" },
          { name: "delete", label: "Eliminar", color: "error" },
        ]}
        onAction={(name, item) => handleAction(name, item as Answer)}
      />
    </div>
  );
};

export default AnswerList;
