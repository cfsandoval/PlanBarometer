import { Model } from "@/types/planbarometro";

export const MODELS: Model[] = [
  {
    id: "topp",
    name: "TOPP Capabilities",
    description: "Evaluates Technical, Operational, Political and Prospective capabilities for managing transformations.",
    dimensions: [
      {
        id: "technical",
        name: "Technical Capacity",
        description: "Analyze the degree of availability and use of evidence, expert knowledge and technical tools in public management.",
        color: "bg-blue-500",
        icon: "cog",
        criteria: [
          {
            id: "t1_1",
            name: "Evidence-based diagnosis",
            elements: [
              { id: "t1_1_1", text: "Does the diagnosis start from validated data?" },
              { id: "t1_1_2", text: "Was territorialized evidence consulted?" }
            ]
          },
          {
            id: "t1_2",
            name: "Use of analytical tools",
            elements: [
              { id: "t1_2_1", text: "Are models, logical frameworks, theories of change employed?" }
            ]
          },
          {
            id: "t1_3",
            name: "Calidad y disponibilidad de datos",
            elements: [
              { id: "t1_3_1", text: "¿Hay registros administrativos útiles?" },
              { id: "t1_3_2", text: "¿Los datos están actualizados?" }
            ]
          },
          {
            id: "t1_4",
            name: "Capacidad de análisis técnico interno",
            elements: [
              { id: "t1_4_1", text: "¿Existe una unidad técnica con autonomía y formación adecuada?" }
            ]
          }
        ]
      },
      {
        id: "operational",
        name: "Operational Capacity",
        description: "Evaluate if there are resources, structures and processes that allow effective implementation of public policies.",
        color: "bg-green-500",
        icon: "tools",
        criteria: [
          {
            id: "t2_1",
            name: "Claridad de roles y mandatos",
            elements: [
              { id: "t2_1_1", text: "¿Las funciones están normativamente definidas y son operativas?" }
            ]
          },
          {
            id: "t2_2",
            name: "Recursos humanos suficientes y capacitados",
            elements: [
              { id: "t2_2_1", text: "¿Hay equipos técnicos estables?" },
              { id: "t2_2_2", text: "¿Existe baja rotación del personal?" }
            ]
          },
          {
            id: "t2_3",
            name: "Estructura organizacional habilitante",
            elements: [
              { id: "t2_3_1", text: "¿La estructura facilita coordinación y ejecución?" }
            ]
          },
          {
            id: "t2_4",
            name: "Capacidad presupuestaria",
            elements: [
              { id: "t2_4_1", text: "¿Se cuenta con financiamiento previsible para implementar decisiones?" }
            ]
          }
        ]
      },
      {
        id: "political",
        name: "Political Capacity", 
        description: "Measure the capacity to build legitimacy, align interests, coordinate actors and sustain complex decisions.",
        color: "bg-purple-500",
        icon: "handshake",
        criteria: [
          {
            id: "t3_1",
            name: "Participación de actores clave",
            elements: [
              { id: "t3_1_1", text: "¿Fueron incluidos actores relevantes en el diseño?" }
            ]
          },
          {
            id: "t3_2",
            name: "Mecanismos de diálogo político",
            elements: [
              { id: "t3_2_1", text: "¿Existen espacios institucionales de negociación?" }
            ]
          },
          {
            id: "t3_3",
            name: "Alineación entre niveles de gobierno",
            elements: [
              { id: "t3_3_1", text: "¿Los niveles subnacional y nacional actúan coordinadamente?" }
            ]
          },
          {
            id: "t3_4",
            name: "Liderazgo y voluntad política",
            elements: [
              { id: "t3_4_1", text: "¿Existe respaldo explícito de autoridades a las decisiones técnicas?" }
            ]
          }
        ]
      },
      {
        id: "prospective",
        name: "Prospective Capacity",
        description: "Examine the capacity to anticipate disruptions, build shared visions and guide the strategic direction of transformations.",
        color: "bg-orange-500",
        icon: "eye",
        criteria: [
          {
            id: "t4_1",
            name: "Construcción de visión compartida",
            elements: [
              { id: "t4_1_1", text: "¿Existe una visión estratégica co-construida a largo plazo?" }
            ]
          },
          {
            id: "t4_2",
            name: "Escenarios futuros y anticipación",
            elements: [
              { id: "t4_2_1", text: "¿Se han construido escenarios alternativos?" },
              { id: "t4_2_2", text: "¿Se consideran disrupciones potenciales?" }
            ]
          },
          {
            id: "t4_3",
            name: "Mecanismos de revisión iterativa",
            elements: [
              { id: "t4_3_1", text: "¿Se han definido momentos y procesos para actualizar políticas o planes?" }
            ]
          },
          {
            id: "t4_4",
            name: "Capacidad de aprendizaje institucional",
            elements: [
              { id: "t4_4_1", text: "¿Se documentan aprendizajes y se ajustan políticas a partir de la experiencia?" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "nacional",
    name: "National Level",
    description: "Focus on government instruments and state administration for national development.",
    dimensions: [] // Placeholder - would be populated with nacional criteria
  },
  {
    id: "subnacional",
    name: "Subnational Level",
    description: "Analysis of articulation between national and subnational levels of planning.",
    dimensions: [] // Placeholder - would be populated with subnacional criteria
  }
];
