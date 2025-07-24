import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODELS } from "@/lib/planbarometro-data";

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⚙️</span>
          Selección de Modelo de Evaluación
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {MODELS.map((model) => (
            <div
              key={model.id}
              className={`cursor-pointer transition-all hover:shadow-lg rounded-lg p-4 border-2 ${
                selectedModel === model.id
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100"
                  : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
              }`}
              onClick={() => onModelSelect(model.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${selectedModel === model.id ? "text-blue-700" : "text-gray-700"}`}>
                  {model.name}
                </h3>
                {model.id === "topp" && (
                  <Badge variant="default" className="bg-blue-600">Recomendado</Badge>
                )}
                {model.id !== "topp" && (
                  <Badge variant="secondary">Disponible</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{model.description}</p>
              <div className="text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>{model.dimensions.length} Dimensiones</span>
                  <span>{model.dimensions.reduce((acc, dim) => acc + dim.criteria.length, 0)} Criterios</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
