import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericTable from "../../components/Generics/GenericList";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import { securityQuestionService } from "../../services/securityQuestionService";

const SecurityQuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await securityQuestionService.getAll();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action: string, item: SecurityQuestion) => {
    if (action === "edit") {
      navigate(`/security-questions/editar/${item.id}`);
    } else if (action === "delete" && item.id) {
      const result = await Swal.fire({
        title: "¿Eliminar pregunta?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });
      if (result.isConfirmed) {
        await securityQuestionService.delete(item.id);
        Swal.fire("Eliminada", "La pregunta se eliminó correctamente.", "success");
        fetchData();
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Preguntas de Seguridad</h3>
        <Button variant="success" onClick={() => navigate("/security-questions/crear")}>
          Crear Pregunta
        </Button>
      </div>

      <GenericTable
        data={questions}
        columns={["id", "name", "description"]}
        actions={[
          { name: "edit", label: "Editar" },
          { name: "delete", label: "Eliminar" },
        ]}
        onAction={(name, item) => handleAction(name, item as SecurityQuestion)}
      />
    </div>
  );
};

export default SecurityQuestionList;
