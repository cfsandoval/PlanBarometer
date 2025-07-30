import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Lightbulb, Target, TrendingUp, AlertCircle } from "lucide-react";
import { EvaluationScores, Model, StrategicAlert } from "@/types/planbarometro";
import { t } from "@/lib/i18n";

interface Message {
  id: string;
  type: 'user' | 'mentor';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionItems?: string[];
}

interface CoachingChatProps {
  scores: EvaluationScores;
  model: Model;
  alerts: StrategicAlert[];
  isEvaluationComplete: boolean;
}

export default function CoachingChat({ scores, model, alerts, isEvaluationComplete }: CoachingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isEvaluationComplete && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([welcomeMessage]);
    }
  }, [isEvaluationComplete, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const generateWelcomeMessage = (): Message => {
    const overallScore = scores.overall;
    const highestDimension = scores.dimensions.reduce((prev, current) => 
      prev.percentage > current.percentage ? prev : current
    );
    const lowestDimension = scores.dimensions.reduce((prev, current) => 
      prev.percentage < current.percentage ? prev : current
    );

    let welcomeContent = `¡Hola! Soy tu mentor de planificación institucional. He revisado tu evaluación y veo que tu capacidad general está en ${overallScore}%.

**Análisis rápido:**
• **Fortaleza principal:** ${getDimensionName(highestDimension.dimensionId)} (${highestDimension.percentage}%)
• **Área de mejora:** ${getDimensionName(lowestDimension.dimensionId)} (${lowestDimension.percentage}%)
• **Alertas activas:** ${alerts.length} situaciones identificadas

¿En qué te gustaría que te ayude hoy? Puedo:
- Explicarte tus resultados en detalle
- Sugerir acciones específicas para mejorar
- Ayudarte a priorizar intervenciones
- Responder preguntas sobre planificación institucional`;

    const suggestions = [
      "¿Cómo puedo mejorar mi capacidad más débil?",
      "¿Qué significa mi puntuación general?",
      "Dame un plan de acción prioritario",
      "Explícame las alertas más importantes"
    ];

    return {
      id: Date.now().toString(),
      type: 'mentor',
      content: welcomeContent,
      timestamp: new Date(),
      suggestions
    };
  };

  const getDimensionName = (dimensionId: string): string => {
    const dimension = model.dimensions.find(d => d.id === dimensionId);
    return dimension?.name || dimensionId;
  };

  const generateMentorResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let content = '';
    let suggestions: string[] = [];
    let actionItems: string[] = [];

    // Analyze user intent and generate appropriate response
    if (lowerMessage.includes('mejorar') || lowerMessage.includes('capacidad') || lowerMessage.includes('débil')) {
      content = generateImprovementAdvice();
      suggestions = [
        "¿Qué recursos necesito para esto?",
        "¿Cuánto tiempo tomará ver resultados?",
        "Dame ejemplos específicos",
        "¿Cómo mido el progreso?"
      ];
    } else if (lowerMessage.includes('plan') || lowerMessage.includes('acción') || lowerMessage.includes('prioridad')) {
      content = generateActionPlan();
      actionItems = generateActionItems();
      suggestions = [
        "¿Por dónde empiezo exactamente?",
        "¿Qué obstáculos puedo encontrar?",
        "¿Cómo involucro a mi equipo?",
        "Necesito más detalles sobre esto"
      ];
    } else if (lowerMessage.includes('alerta') || lowerMessage.includes('riesgo') || lowerMessage.includes('problema')) {
      content = generateAlertAnalysis();
      suggestions = [
        "¿Cómo prevenir estos riesgos?",
        "¿Qué pasa si no atiendo esto?",
        "Dame estrategias específicas",
        "¿Hay alertas más urgentes?"
      ];
    } else if (lowerMessage.includes('puntuación') || lowerMessage.includes('resultado') || lowerMessage.includes('significa')) {
      content = generateScoreExplanation();
      suggestions = [
        "¿Cómo se compara con otras instituciones?",
        "¿Qué puntuación debería tener?",
        "¿Cómo interpreto cada dimensión?",
        "¿Es suficiente para mi contexto?"
      ];
    } else {
      content = generateGeneralResponse(userMessage);
      suggestions = [
        "Dame consejos específicos para mi situación",
        "¿Qué haría una institución exitosa?",
        "Ayúdame a priorizar mis esfuerzos",
        "¿Cómo mido el impacto de los cambios?"
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'mentor',
      content,
      timestamp: new Date(),
      suggestions,
      actionItems: actionItems.length > 0 ? actionItems : undefined
    };
  };

  const generateImprovementAdvice = (): string => {
    const lowestDimension = scores.dimensions.reduce((prev, current) => 
      prev.percentage < current.percentage ? prev : current
    );
    
    const dimensionName = getDimensionName(lowestDimension.dimensionId);
    const percentage = lowestDimension.percentage;

    let advice = `Para mejorar tu **${dimensionName}** (actualmente ${percentage}%), te recomiendo:\n\n`;

    switch (lowestDimension.dimensionId) {
      case 'technical':
        advice += `**Capacidad Técnica:**
• Fortalecer equipos con capacitación especializada
• Implementar sistemas de información más robustos
• Desarrollar metodologías de diagnóstico y análisis
• Crear protocolos de calidad técnica
• Establecer alianzas con centros de investigación`;
        break;
      case 'operational':
        advice += `**Capacidad Operativa:**
• Revisar y optimizar procesos organizacionales
• Mejorar sistemas de gestión y monitoreo
• Fortalecer estructuras de coordinación
• Implementar herramientas de seguimiento
• Desarrollar capacidades de ejecución`;
        break;
      case 'political':
        advice += `**Capacidad Política:**
• Construir coaliciones y alianzas estratégicas
• Desarrollar habilidades de negociación
• Mejorar comunicación con stakeholders
• Fortalecer liderazgo institucional
• Crear espacios de diálogo y consenso`;
        break;
      case 'prospective':
        advice += `**Capacidad Prospectiva:**
• Implementar sistemas de alerta temprana
• Desarrollar escenarios futuros
• Crear procesos de planificación estratégica
• Fortalecer capacidades de anticipación
• Establecer mecanismos de adaptación`;
        break;
    }

    return advice;
  };

  const generateActionPlan = (): string => {
    const criticalAlerts = alerts.filter(a => a.severity === 'high');
    const moderateAlerts = alerts.filter(a => a.severity === 'medium');

    return `**Plan de Acción Prioritario:**

**🔴 Acciones Inmediatas (0-3 meses):**
${criticalAlerts.length > 0 ? 
  criticalAlerts.slice(0, 2).map(alert => `• ${alert.recommendation || 'Atender: ' + alert.title}`).join('\n') :
  '• Consolidar fortalezas existentes\n• Establecer sistemas de monitoreo'
}

**🟡 Acciones Intermedias (3-6 meses):**
${moderateAlerts.length > 0 ?
  moderateAlerts.slice(0, 2).map(alert => `• ${alert.recommendation || 'Mejorar: ' + alert.title}`).join('\n') :
  '• Desarrollar capacidades complementarias\n• Implementar mejoras incrementales'
}

**🟢 Acciones a Largo Plazo (6-12 meses):**
• Institucionalizar mejores prácticas
• Evaluar y ajustar estrategias
• Expandir capacidades avanzadas
• Preparar siguiente ciclo de desarrollo`;
  };

  const generateActionItems = (): string[] => {
    const items = [
      "Formar equipo de trabajo para implementación",
      "Definir indicadores de seguimiento",
      "Asignar responsables y plazos",
      "Identificar recursos necesarios",
      "Establecer cronograma de revisiones"
    ];

    const specificItems: string[] = [];
    
    if (alerts.length > 0) {
      const highPriorityAlert = alerts.find(a => a.severity === 'high');
      if (highPriorityAlert) {
        specificItems.push(`Atender urgentemente: ${highPriorityAlert.title}`);
      }
    }

    const lowestDimension = scores.dimensions.reduce((prev, current) => 
      prev.percentage < current.percentage ? prev : current
    );
    
    specificItems.push(`Priorizar mejora en ${getDimensionName(lowestDimension.dimensionId)}`);

    return [...specificItems, ...items.slice(0, 3)];
  };

  const generateAlertAnalysis = (): string => {
    if (alerts.length === 0) {
      return `¡Excelente! No tienes alertas críticas activas. Tu institución muestra un equilibrio saludable en las capacidades evaluadas.

**Recomendaciones preventivas:**
• Mantener monitoreo continuo
• Fortalecer áreas con menor puntuación
• Prepararse para cambios del entorno
• Documentar mejores prácticas actuales`;
    }

    const highAlerts = alerts.filter(a => a.severity === 'high');
    const mediumAlerts = alerts.filter(a => a.severity === 'medium');

    let analysis = `**Análisis de Alertas Estratégicas:**\n\n`;

    if (highAlerts.length > 0) {
      analysis += `🔴 **Alertas Críticas (${highAlerts.length}):**\n`;
      highAlerts.forEach(alert => {
        analysis += `• **${alert.title}**: ${alert.description}\n`;
      });
      analysis += '\n';
    }

    if (mediumAlerts.length > 0) {
      analysis += `🟡 **Alertas Moderadas (${mediumAlerts.length}):**\n`;
      mediumAlerts.slice(0, 2).forEach(alert => {
        analysis += `• **${alert.title}**: ${alert.description}\n`;
      });
    }

    analysis += `\n**Impacto potencial:** Las alertas críticas pueden afectar significativamente tu capacidad de planificación y ejecución. Te recomiendo abordarlas en orden de prioridad.`;

    return analysis;
  };

  const generateScoreExplanation = (): string => {
    const overall = scores.overall;
    let interpretation = '';

    if (overall >= 75) {
      interpretation = '**Excelente** - Tu institución tiene capacidades muy desarrolladas para la planificación estratégica.';
    } else if (overall >= 50) {
      interpretation = '**Bueno** - Tienes una base sólida con oportunidades específicas de mejora.';
    } else if (overall >= 25) {
      interpretation = '**Regular** - Necesitas fortalecer varias capacidades para optimizar tu planificación.';
    } else {
      interpretation = '**Deficiente** - Requieres una transformación significativa en tus capacidades institucionales.';
    }

    return `**Interpretación de tu Puntuación (${overall}%):**

${interpretation}

**Desglose por dimensiones:**
${scores.dimensions.map(dim => {
  const name = getDimensionName(dim.dimensionId);
  const status = dim.percentage >= 75 ? '🟢' : dim.percentage >= 50 ? '🟡' : '🔴';
  return `${status} **${name}:** ${dim.percentage}%`;
}).join('\n')}

**Contexto de referencia:**
• 75%+ = Capacidad avanzada
• 50-74% = Capacidad intermedia  
• 25-49% = Capacidad básica
• <25% = Capacidad crítica

Tu puntuación refleja el estado actual de tus capacidades institucionales para la planificación del desarrollo.`;
  };

  const generateGeneralResponse = (userMessage: string): string => {
    return `Entiendo tu consulta sobre "${userMessage}". 

Basándome en tu evaluación, puedo ayudarte a:

• **Interpretar tus resultados** y entender qué significan para tu institución
• **Identificar prioridades** según tu contexto específico
• **Desarrollar estrategias** para fortalecer capacidades débiles
• **Aprovechar fortalezas** existentes para impulsar mejoras
• **Planificar intervenciones** con impacto medible

¿Te gustaría que profundice en algún aspecto específico? Puedo ser más concreto según tus necesidades particulares.`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate mentor thinking time
    setTimeout(() => {
      const mentorResponse = generateMentorResponse(inputValue);
      setMessages(prev => [...prev, mentorResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isEvaluationComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mentor de Planificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md">
              <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Mentor de Planificación
              </h3>
              <p className="text-blue-700">
                Completa tu evaluación para acceder al chat inteligente con tu mentor personal de planificación institucional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Mentor de Planificación Institucional
          <Badge variant="secondary" className="ml-auto">
            <Lightbulb className="h-3 w-3 mr-1" />
            IA Inteligente
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-1 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>

                  {message.actionItems && (
                    <div className="mt-3 p-2 bg-green-50 rounded border-l-2 border-green-500">
                      <div className="flex items-center gap-1 mb-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Acciones Recomendadas
                        </span>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        {message.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Tu mentor está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntale a tu mentor sobre planificación institucional..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>Tu mentor analiza tu evaluación para darte consejos personalizados</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}