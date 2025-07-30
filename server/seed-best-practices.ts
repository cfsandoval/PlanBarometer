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
  },
  // === CASOS ESPECÍFICOS DOCUMENTADOS DE PERÚ ===
  {
    title: "MineduLAB - Laboratorio de Innovación Educativa",
    description: "Primer laboratorio de innovación costo-efectiva de la política educativa en Perú, que diseña, implementa y evalúa innovaciones para mejorar el aprendizaje estudiantil",
    country: "Perú",
    institution: "Ministerio de Educación - Oficina de Seguimiento y Evaluación Estratégica",
    year: 2014,
    sourceUrl: "http://www.minedu.gob.pe/minedulab",
    sourceType: "institutional",
    targetCriteria: ["Innovación pública", "Evaluación de impacto", "Metodologías basadas en evidencia", "Laboratorios de gobierno"],
    results: "14 innovaciones diseñadas, implementadas y evaluadas. Premio Buenas Prácticas en Gestión Pública 2018. Programas como 'Expande tu mente' (Growth Mindset) y 'Decidiendo por un futuro mejor' para reducir deserción escolar",
    keyLessons: [
      "Los laboratorios de innovación requieren metodologías rigurosas de evaluación",
      "Las alianzas con centros de investigación fortalecen la evidencia",
      "Los programas de bajo costo pueden tener alto impacto si están bien diseñados"
    ],
    tags: ["laboratorio de innovación", "educación", "evaluación de impacto", "MineduLAB"]
  },
  {
    title: "TUKUY RIKUY - Sistema de Alerta Temprana Energética",
    description: "Sistema de alerta temprana para reportar deficiencias en servicios energéticos mediante SMS gratuitos, especialmente en zonas rurales",
    country: "Perú",
    institution: "OSINERGMIN - Organismo Supervisor de la Inversión en Energía y Minería",
    year: 2015,
    sourceUrl: "https://atenciontukuy.osinergmin.gob.pe/",
    sourceType: "institutional",
    targetCriteria: ["Sistemas de alerta", "Inclusión digital", "Supervisión ciudadana", "Tecnologías accesibles"],
    results: "90.5% de reducción en plazos de atención de interrupciones eléctricas en zonas rurales. 1.5 millones de beneficiarios en 533 localidades. Ahorro de S/48.49 anuales por poblador rural. Premio Especial Innovación Pública 2018",
    keyLessons: [
      "Los SMS son tecnología accesible para poblaciones rurales sin smartphones",
      "Las alianzas con actores locales (gestores de tambos, docentes) amplían la cobertura",
      "Los sistemas de alerta deben incluir seguimiento hasta el cierre del caso"
    ],
    tags: ["alerta temprana", "SMS", "energía", "zonas rurales", "TUKUY RIKUY"]
  },
  {
    title: "Siembra y Cosecha de Agua - FONCODES",
    description: "Programa que combate la pobreza extrema rural mediante tecnologías ancestrales de gestión hídrica adaptadas al cambio climático",
    country: "Perú",
    institution: "FONCODES - Fondo de Cooperación para el Desarrollo Social",
    year: 2012,
    sourceUrl: "https://www.gob.pe/foncodes",
    sourceType: "institutional",
    targetCriteria: ["Adaptación climática", "Tecnologías ancestrales", "Seguridad hídrica", "Desarrollo rural"],
    results: "197 familias beneficiadas inicialmente, 411,700 m³ de agua almacenada, 400,000 m² irrigados. Evaluación GRADE: 35% aumento en ingresos por servicios, ratio costo-beneficio de 2.8. S/743 millones invertidos desde 2012",
    keyLessons: [
      "Las tecnologías ancestrales pueden ser altamente efectivas para adaptación climática",
      "La metodología 'campesino a campesino' facilita la transferencia de conocimientos",
      "Los programas integrales (agua + producción + capacitación) maximizan el impacto"
    ],
    tags: ["siembra y cosecha de agua", "tecnologías ancestrales", "cambio climático", "qochas"]
  },
  {
    title: "Registro Civil Bilingüe - RENIEC",
    description: "Primer sistema de registro civil bilingüe de América Latina que atiende en 12 lenguas originarias, eliminando barreras culturales e idiomáticas",
    country: "Perú",
    institution: "RENIEC - Registro Nacional de Identificación y Estado Civil",
    year: 2014,
    sourceUrl: "https://www.reniec.gob.pe/portal/html/registro-civil-bilingue/",
    sourceType: "institutional",
    targetCriteria: ["Inclusión cultural", "Derechos lingüísticos", "Interculturalidad", "Modernización de servicios"],
    results: "780 oficinas implementadas a nivel nacional. 12 lenguas indígenas disponibles incluyendo Quechua, Aimara, Awajún, Shipibo, entre otras. Más de 5 millones de peruanos potencialmente beneficiados",
    keyLessons: [
      "Los servicios bilingües requieren validación cultural con las comunidades usuarias",
      "La capacitación especializada del personal es fundamental para la calidad del servicio",
      "Los sistemas híbridos (digital/manual) permiten cobertura en zonas sin conectividad"
    ],
    tags: ["registro civil bilingüe", "lenguas originarias", "interculturalidad", "RENIEC"]
  },
  {
    title: "Saberes Productivos - Pensión 65",
    description: "Innovación social que revalora a adultos mayores a través de sus saberes ancestrales, promoviendo transferencia intergeneracional de conocimientos",
    country: "Perú",
    institution: "Programa Nacional de Asistencia Solidaria Pensión 65 - MIDIS",
    year: 2013,
    sourceUrl: "https://www.pension65.gob.pe/",
    sourceType: "institutional",
    targetCriteria: ["Innovación social", "Inclusión del adulto mayor", "Saberes ancestrales", "Articulación intergubernamental"],
    results: "95.5% de participantes declaró sentirse muy feliz o feliz. 9 de cada 10 consideró que mejoró su estado de ánimo. Museo de Saberes Ancestrales 'Apu Tinka' inaugurado en 2018. Modelo replicado en Colombia",
    keyLessons: [
      "La articulación con gobiernos locales desde el inicio es clave para la sostenibilidad",
      "Los adultos mayores poseen conocimientos valiosos que pueden beneficiar a toda la comunidad",
      "Los programas de transferencia intergeneracional fortalecen la identidad cultural"
    ],
    tags: ["saberes productivos", "adulto mayor", "transferencia intergeneracional", "Pensión 65"]
  },
  {
    title: "Sistema MasiGas - Masificación del Gas Natural",
    description: "Plataforma tecnológica integral para facilitar el acceso ciudadano al gas natural con información permanente y procedimientos seguros",
    country: "Perú",
    institution: "OSINERGMIN - Organismo Supervisor de la Inversión en Energía y Minería",
    year: 2016,
    sourceUrl: "http://www.osinergmin.gob.pe/empresas/gas_natural/sistema-masigas",
    sourceType: "institutional",
    targetCriteria: ["Plataformas digitales", "Transparencia regulatoria", "Acceso a servicios", "Competencia de mercado"],
    results: "102% de incremento de empresas instaladoras (2016-2018). 15% de reducción en precio de instalación interna. Reconocido como Buena Práctica en Gestión Pública 2018",
    keyLessons: [
      "Las plataformas digitales pueden promover competencia y reducir precios",
      "La información transparente empodera a los ciudadanos para tomar mejores decisiones",
      "Los registros de proveedores certificados mejoran la calidad y seguridad del servicio"
    ],
    tags: ["MasiGas", "gas natural", "plataformas digitales", "competencia"]
  },
  {
    title: "Convenio Marco de Contrataciones - Perú Compras",
    description: "Sistema de catálogos electrónicos que moderniza las contrataciones del Estado mediante acuerdos marco con proveedores preseleccionados",
    country: "Perú",
    institution: "PERÚ COMPRAS - Central de Compras Públicas",
    year: 2010,
    sourceUrl: "https://www.gob.pe/perucompras",
    sourceType: "institutional",
    targetCriteria: ["Modernización del Estado", "Eficiencia en compras", "Transparencia", "Digitalización"],
    results: "41 catálogos electrónicos correspondientes a 25 acuerdos marco vigentes. Formalización contractual en 1 día con 3 pasos. Reducción significativa en costos de procedimientos",
    keyLessons: [
      "Los catálogos electrónicos simplifican radicalmente los procesos de compra",
      "Los acuerdos marco previos facilitan la contratación ágil y transparente",
      "La competencia entre proveedores en plataformas digitales reduce precios"
    ],
    tags: ["convenio marco", "contrataciones públicas", "catálogos electrónicos", "Perú Compras"]
  },
  // === CASOS ADICIONALES LATINOAMERICANOS ===
  {
    title: "Sistema Único de Beneficiarios (SIUBEN) - República Dominicana",
    description: "Sistema que identifica y categoriza personas en situación de vulnerabilidad para asegurar acceso a programas sociales y subsidios monetarios",
    country: "República Dominicana",
    institution: "Sistema Único de Beneficiarios",
    year: 2004,
    sourceUrl: "https://siuben.gob.do/",
    sourceType: "institutional",
    targetCriteria: ["Focalización de beneficiarios", "Sistemas de información social", "Transparencia", "Articulación de programas"],
    results: "Identificación sistemática de hogares vulnerables, mejora en focalización de programas sociales, reducción de duplicidad de beneficiarios, portal de transparencia activo",
    keyLessons: [
      "Los registros únicos evitan duplicidades y mejoran la focalización",
      "La transparencia en los registros de beneficiarios genera confianza ciudadana",
      "Los sistemas de categorización permiten graduar las intervenciones según vulnerabilidad"
    ],
    tags: ["SIUBEN", "focalización", "beneficiarios", "República Dominicana"]
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