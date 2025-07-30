import { storage } from "./storage";
import type { InsertBestPractice, InsertPracticeRecommendation } from "@shared/schema";

const initialBestPractices: InsertBestPractice[] = [
  {
    title: "Sistema de Ventanilla Única Empresarial - Medellín",
    description: "Implementación de una ventanilla única para simplificar trámites empresariales, reduciendo de 45 a 3 días el tiempo de constitución de empresas mediante coordinación interinstitucional efectiva",
    country: "Colombia",
    institution: "Alcaldía de Medellín",
    year: 2018,
    sourceUrl: "https://politicaspublicas.uc.cl/web/content/uploads/2020/03/LIBRO_innovaciones-municpales_OK_Version-DIGITAL-2.pdf",
    sourceType: "academic",
    targetCriteria: ["Coordinación institucional", "Simplificación de procesos", "Eficiencia administrativa", "Innovación gubernamental"],
    results: "Reducción del 93% en tiempos de trámites (de 45 a 3 días), incremento del 40% en creación de nuevas empresas, mejora del 85% en satisfacción empresarial",
    keyLessons: [
      "La coordinación entre múltiples instituciones requiere protocolos claros y sistemas integrados",
      "Los incentivos alineados entre entidades son fundamentales para el éxito",
      "La digitalización debe acompañarse de capacitación del personal y rediseño de procesos"
    ],
    tags: ["ventanilla única", "coordinación", "simplificación", "empresas"]
  },
  {
    title: "Presupuesto Participativo Digital - Porto Alegre",
    description: "Sistema de presupuesto participativo que permite a los ciudadanos proponer y votar proyectos de inversión municipal utilizando plataformas digitales y asambleas territoriales",
    country: "Brasil",
    institution: "Prefeitura de Porto Alegre",
    year: 2019,
    sourceUrl: "https://publications.iadb.org/es/publications/spanish/viewer/Libro-de-buenas-pr%C3%A1cticas-de-gesti%C3%B3n-para-resultados-en-el-desarrollo-en-Latinoam%C3%A9rica-y-el-Caribe.pdf",
    sourceType: "pdf",
    targetCriteria: ["Participación ciudadana", "Presupuesto participativo", "Transparencia", "Gestión financiera"],
    results: "Participación de 50,000 ciudadanos anuales, ejecución del 95% de proyectos aprobados, mejora del 60% en confianza institucional",
    keyLessons: [
      "La combinación de canales digitales y presenciales amplía la participación",
      "Los mecanismos de seguimiento y rendición de cuentas son esenciales",
      "La capacitación ciudadana en temas presupuestarios fortalece la calidad de las propuestas"
    ],
    tags: ["presupuesto participativo", "participación", "transparencia", "Brasil"]
  },
  {
    title: "Plataforma de Gobierno Abierto - Quito",
    description: "Implementación de una plataforma digital integral que permite el acceso a información pública, participación ciudadana en políticas y seguimiento de compromisos gubernamentales en tiempo real",
    country: "Ecuador",
    institution: "Municipio de Quito",
    year: 2020,
    sourceUrl: "https://revistas.flacsoandes.edu.ec/mundosplurales/article/view/6419/4992",
    sourceType: "academic",
    targetCriteria: ["Transparencia", "Acceso a información", "Participación ciudadana", "Gobierno abierto"],
    results: "150,000 usuarios activos, 80% de reducción en solicitudes de información presenciales, incremento del 200% en propuestas ciudadanas",
    keyLessons: [
      "La interoperabilidad entre sistemas gubernamentales facilita el acceso a información",
      "Los formatos de datos abiertos permiten el uso creativo por parte de la sociedad civil",
      "La retroalimentación ciudadana mejora continuamente los servicios digitales"
    ],
    tags: ["gobierno abierto", "transparencia", "datos abiertos", "Ecuador"]
  },
  {
    title: "Metodología de Diagnóstico Basado en Evidencia - Chile",
    description: "Desarrollo de una metodología sistemática para el diagnóstico de políticas públicas utilizando análisis de datos, evaluaciones de impacto y consultas ciudadanas estructuradas",
    country: "Chile",
    institution: "Ministerio de Desarrollo Social y Familia",
    year: 2021,
    sourceUrl: "https://revistasonline.inap.es/index.php/GAPP/issue/view/754/130",
    sourceType: "web",
    targetCriteria: ["Diagnóstico basado en evidencia", "Análisis de políticas", "Evaluación", "Metodologías"],
    results: "Aplicación en 45 políticas nacionales, mejora del 40% en precisión de diagnósticos, reducción del 25% en costos de implementación",
    keyLessons: [
      "Los datos cuantitativos deben complementarse con análisis cualitativos",
      "La participación de múltiples actores enriquece el diagnóstico",
      "Los sistemas de información integrados facilitan el análisis longitudinal"
    ],
    tags: ["diagnóstico", "evidencia", "análisis", "metodología"]
  },
  {
    title: "Sistema de Monitoreo en Tiempo Real - Perú",
    description: "Implementación de un sistema digital para monitoreo continuo de indicadores de gestión pública con alertas automáticas y reportes ejecutivos en tiempo real",
    country: "Perú",
    institution: "Presidencia del Consejo de Ministros",
    year: 2020,
    sourceUrl: "https://www.up.edu.pe/egp/Documentos/Caso-N1.pdf",
    sourceType: "case_study",
    targetCriteria: ["Monitoreo y evaluación", "Sistemas de información", "Gestión por resultados", "Tecnología"],
    results: "Reducción del 50% en tiempo de generación de reportes, mejora del 70% en toma de decisiones oportunas, incremento del 35% en cumplimiento de metas",
    keyLessons: [
      "Los indicadores deben ser específicos, medibles y actualizables automáticamente",
      "Las alertas tempranas permiten correcciones oportunas en la gestión",
      "La capacitación en uso de herramientas es fundamental para la adopción"
    ],
    tags: ["monitoreo", "tiempo real", "indicadores", "Perú"]
  },
  {
    title: "Red de Diálogo Político Multinivel - México",
    description: "Creación de espacios institucionalizados de diálogo entre gobierno federal, estatal y municipal para coordinación de políticas y resolución de conflictos intergubernamentales",
    country: "México",
    institution: "Secretaría de Gobernación",
    year: 2019,
    sourceUrl: "https://www.up.edu.pe/egp/Documentos/Caso-N2.pdf",
    sourceType: "case_study",
    targetCriteria: ["Diálogo político", "Coordinación intergubernamental", "Mecanismos de consenso", "Articulación institucional"],
    results: "Resolución del 80% de conflictos intergubernamentales, incremento del 45% en proyectos coordinados entre niveles, mejora del 60% en eficiencia de políticas",
    keyLessons: [
      "Los espacios de diálogo deben estar formalmente institucionalizados",
      "Los mecanismos de seguimiento de acuerdos son esenciales para la credibilidad",
      "La rotación de la presidencia de la red fortalece la legitimidad"
    ],
    tags: ["diálogo político", "coordinación", "intergubernamental", "México"]
  },
  {
    title: "Fortalecimiento de Capacidades Institucionales - Guatemala",
    description: "Programa integral de desarrollo de capacidades técnicas y administrativas en municipalidades rurales, incluyendo capacitación, asistencia técnica y sistemas de gestión",
    country: "Guatemala",
    institution: "Secretaría de Planificación y Programación de la Presidencia",
    year: 2020,
    sourceUrl: "https://ojs.icap.ac.cr/index.php/RCAP/issue/view/15/17",
    sourceType: "web",
    targetCriteria: ["Fortalecimiento institucional", "Capacitación", "Desarrollo de capacidades", "Gestión municipal"],
    results: "Capacitación de 1,500 funcionarios municipales, mejora del 55% en calidad de proyectos, incremento del 40% en ejecución presupuestaria",
    keyLessons: [
      "Los programas de capacitación deben adaptarse al contexto local",
      "El acompañamiento técnico continuo es más efectivo que talleres aislados",
      "Los sistemas de certificación motivan la participación y mejoran la calidad"
    ],
    tags: ["capacitación", "fortalecimiento", "municipios", "Guatemala"]
  },
  {
    title: "Construcción de Visión Estratégica Participativa - Costa Rica",
    description: "Metodología para construir visiones estratégicas de largo plazo mediante procesos participativos que integran actores públicos, privados y sociedad civil",
    country: "Costa Rica",
    institution: "Ministerio de Planificación Nacional y Política Económica",
    year: 2021,
    sourceUrl: "https://ojs.icap.ac.cr/index.php/RCAP/issue/view/15/17",
    sourceType: "web",
    targetCriteria: ["Visión estratégica", "Planificación participativa", "Construcción de consensos", "Largo plazo"],
    results: "Participación de 500 actores clave, consenso del 85% en visión país 2050, incorporación en 12 planes sectoriales",
    keyLessons: [
      "Los procesos participativos requieren metodologías estructuradas y facilitación experta",
      "La representatividad de actores es fundamental para la legitimidad",
      "Los mecanismos de seguimiento aseguran la implementación de los acuerdos"
    ],
    tags: ["visión estratégica", "participación", "consensos", "Costa Rica"]
  },
  {
    title: "Sistema de Articulación Intersectorial - Colombia",
    description: "Creación de un sistema formal de coordinación entre sectores para políticas transversales, con protocolos, instancias y herramientas de seguimiento conjunto",
    country: "Colombia",
    institution: "Departamento Nacional de Planeación",
    year: 2020,
    sourceUrl: "https://politicaspublicas.uc.cl/web/content/uploads/2020/03/LIBRO_innovaciones-municpales_OK_Version-DIGITAL-2.pdf",
    sourceType: "academic",
    targetCriteria: ["Articulación intersectorial", "Coordinación institucional", "Políticas transversales", "Trabajo conjunto"],
    results: "Coordinación de 25 políticas transversales, reducción del 40% en duplicidad de programas, mejora del 50% en eficiencia de recursos",
    keyLessons: [
      "Los protocolos de coordinación deben ser claros y vinculantes",
      "Los sistemas de información compartidos facilitan el trabajo conjunto",
      "Los incentivos institucionales deben alinearse con los objetivos de coordinación"
    ],
    tags: ["articulación", "intersectorial", "coordinación", "Colombia"]
  },
  {
    title: "Estructuras Organizacionales Adaptativas - Uruguay",
    description: "Rediseño de estructuras organizacionales públicas con enfoques adaptativos que permiten flexibilidad ante cambios de contexto y nuevos desafíos",
    country: "Uruguay",
    institution: "Oficina Nacional del Servicio Civil",
    year: 2021,
    sourceUrl: "https://publications.iadb.org/es/publications/spanish/viewer/Libro-de-buenas-pr%C3%A1cticas-de-gesti%C3%B3n-para-resultados-en-el-desarrollo-en-Latinoam%C3%A9rica-y-el-Caribe.pdf",
    sourceType: "pdf",
    targetCriteria: ["Estructura organizacional", "Adaptabilidad", "Flexibilidad institucional", "Reforma administrativa"],
    results: "Reestructuración de 15 instituciones públicas, mejora del 30% en capacidad de respuesta, reducción del 25% en tiempos de decisión",
    keyLessons: [
      "Las estructuras rígidas limitan la capacidad de adaptación institucional",
      "Los equipos multidisciplinarios mejoran la resolución de problemas complejos",
      "Los mecanismos de retroalimentación continua permiten ajustes oportunos"
    ],
    tags: ["estructura organizacional", "adaptabilidad", "flexibilidad", "Uruguay"]
  }
];

export async function seedBestPractices() {
  console.log("Seeding best practices database...");
  
  try {
    for (const practice of initialBestPractices) {
      await storage.createBestPractice(practice);
    }
    
    console.log(`Successfully seeded ${initialBestPractices.length} best practices`);
  } catch (error) {
    console.error("Error seeding best practices:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBestPractices();
}