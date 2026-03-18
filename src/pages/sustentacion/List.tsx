import React, { useEffect, useState } from 'react';
import { sustentacionService } from '../../services/sustentacionService';

// Tipo para cada palabra con su contador
interface WordCounter {
  word: string;
  count: number;
}

const SustentacionList: React.FC = () => {
  const [words, setWords] = useState<WordCounter[]>([]);

  useEffect(() => {
    // Cargar los datos iniciales
    setWords(sustentacionService.getList());

    // Suscribirse a cambios
    const unsubscribe = sustentacionService.subscribe(() => {
      setWords([...sustentacionService.getList()]);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Palabras monitorizadas
      </h2>

      {words.length === 0 ? (
        <p className="text-gray-500 italic">No hay palabras registradas aún.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                Palabra
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                Contador
              </th>
            </tr>
          </thead>
          <tbody>
            {words.map((item) => (
              <tr
                key={item.word}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-2 px-4 text-gray-800">{item.word}</td>
                <td className="py-2 px-4 text-gray-700">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SustentacionList;
