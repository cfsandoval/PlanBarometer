import { storage } from "./storage";
import type { InsertBestPractice, InsertPracticeRecommendation } from "@shared/schema";

const initialBestPractices: InsertBestPractice[] = [
  {
    title: "Innovación en la gestión municipal: experiencias en gobiernos locales de América Latina",
    description: "Estudio que analiza innovaciones exitosas en gestión municipal a través de casos de Colombia, Chile, México y otros países latinoamericanos",
    country: "América Latina (varios países)",
    institution: "Pontificia Universidad Católica de Chile",
    year: 2020,
    sourceUrl: "https://politicaspublicas.uc.cl/web/content/uploads/2020/03/LIBRO_innovaciones-municpales_OK_Version-DIGITAL-2.pdf",
    sourceType: "academic",
    targetCriteria: ["Coordinación institucional", "Innovación", "Gestión municipal", "Participación ciudadana"],
    results: "Identificación de 15 casos exitosos de innovación municipal con impacto medible en eficiencia administrativa y satisfacción ciudadana",
    keyLessons: [
      "La innovación municipal requiere liderazgo político fuerte",
      "Los sistemas de gestión digital mejoran la eficiencia en 40-60%",
      "La participación ciudadana es clave para el éxito sostenible"
    ],
    tags: ["gestión municipal", "innovación", "América Latina", "administración pública"]
  },
  {
    title: "Libro de buenas prácticas de gestión para resultados en el desarrollo en Latinoamérica y el Caribe",
    description: "Compendio de mejores prácticas en gestión pública orientada a resultados con casos documentados del BID en la región",
    country: "América Latina y el Caribe",
    institution: "Banco Interamericano de Desarrollo (BID)",
    year: 2018,
    sourceUrl: "https://publications.iadb.org/es/publications/spanish/viewer/Libro-de-buenas-pr%C3%A1cticas-de-gesti%C3%B3n-para-resultados-en-el-desarrollo-en-Latinoam%C3%A9rica-y-el-Caribe.pdf",
    sourceType: "pdf",
    targetCriteria: ["Gestión para resultados", "Planificación estratégica", "Monitoreo y evaluación", "Eficiencia administrativa"],
    results: "Documentación de 25 casos exitosos con mejoras promedio de 35% en indicadores de gestión pública",
    keyLessons: [
      "Los sistemas de monitoreo son esenciales para la gestión por resultados",
      "La capacitación técnica del personal mejora los resultados significativamente",
      "La coordinación intersectorial incrementa el impacto de las políticas"
    ],
    tags: ["gestión por resultados", "BID", "desarrollo", "políticas públicas"]
  },
  {
    title: "Políticas públicas y sistemas de innovación en gobiernos locales",
    description: "Análisis de políticas de innovación implementadas en gobiernos locales de Ecuador con enfoque en participación comunitaria",
    country: "Ecuador",
    institution: "FLACSO Andes",
    year: 2021,
    sourceUrl: "https://revistas.flacsoandes.edu.ec/mundosplurales/article/view/6419/4992",
    sourceType: "academic",
    targetCriteria: ["Innovación", "Participación ciudadana", "Gobiernos locales", "Políticas públicas"],
    results: "Implementación de 8 sistemas de innovación local con incremento del 45% en participación ciudadana",
    keyLessons: [
      "La innovación local requiere marcos regulatorios flexibles",
      "Los espacios de co-creación ciudadana son fundamentales",
      "La sostenibilidad financiera es clave para escalar innovaciones"
    ],
    tags: ["innovación local", "Ecuador", "participación", "FLACSO"]
  },
  {
    title: "Revista de Gestión y Análisis de Políticas Públicas",
    description: "Publicación especializada que documenta casos exitosos de gestión y análisis de políticas públicas en Iberoamérica",
    country: "España/Iberoamérica",
    institution: "Instituto Nacional de Administración Pública (INAP)",
    year: 2023,
    sourceUrl: "https://revistasonline.inap.es/index.php/GAPP/issue/view/754/130",
    sourceType: "web",
    targetCriteria: ["Análisis de políticas", "Gestión pública", "Evaluación", "Transparencia"],
    results: "Compilación de metodologías aplicadas en más de 50 casos de análisis de políticas con resultados verificables",
    keyLessons: [
      "El análisis basado en evidencia mejora la toma de decisiones",
      "La transparencia en datos incrementa la confianza institucional",
      "Los enfoques participativos enriquecen el análisis de políticas"
    ],
    tags: ["análisis de políticas", "INAP", "Iberoamérica", "metodologías"]
  },
  {
    title: "Caso de Estudio: Modernización del Estado Peruano - Caso 1",
    description: "Análisis del proceso de modernización administrativa en el sector público peruano con enfoque en eficiencia operacional",
    country: "Perú",
    institution: "Universidad del Pacífico",
    year: 2019,
    sourceUrl: "https://www.up.edu.pe/egp/Documentos/Caso-N1.pdf",
    sourceType: "case_study",
    targetCriteria: ["Modernización del Estado", "Eficiencia administrativa", "Reforma administrativa"],
    results: "Reducción del 30% en tiempos de trámites y mejora del 25% en satisfacción del usuario",
    keyLessons: [
      "La digitalización acelera significativamente los procesos",
      "La capacitación del personal es crucial para el éxito",
      "Los cambios graduales facilitan la adopción"
    ],
    tags: ["modernización", "Perú", "administración", "Universidad del Pacífico"]
  },
  {
    title: "Caso de Estudio: Gestión por Procesos en el Sector Público - Caso 2",
    description: "Implementación de gestión por procesos en instituciones públicas peruanas para mejorar la eficiencia operativa",
    country: "Perú",
    institution: "Universidad del Pacífico",
    year: 2020,
    sourceUrl: "https://www.up.edu.pe/egp/Documentos/Caso-N2.pdf",
    sourceType: "case_study",
    targetCriteria: ["Gestión por procesos", "Eficiencia operativa", "Calidad de servicio"],
    results: "Mejora del 40% en eficiencia operativa y reducción del 35% en costos administrativos",
    keyLessons: [
      "El mapeo de procesos identifica cuellos de botella críticos",
      "La estandarización mejora la consistencia del servicio",
      "El seguimiento continuo es esencial para mantener mejoras"
    ],
    tags: ["gestión por procesos", "eficiencia", "sector público", "Perú"]
  },
  {
    title: "Caso de Estudio: Gobierno Electrónico y Ciudadanía Digital - Caso 3",
    description: "Desarrollo de plataformas de gobierno electrónico para facilitar el acceso ciudadano a servicios públicos",
    country: "Perú",
    institution: "Universidad del Pacífico",
    year: 2021,
    sourceUrl: "https://www.up.edu.pe/egp/Documentos/Caso-N3.pdf",
    sourceType: "case_study",
    targetCriteria: ["Gobierno electrónico", "Acceso ciudadano", "Digitalización", "Servicios públicos"],
    results: "Incremento del 60% en uso de servicios digitales y reducción del 50% en tiempos de atención",
    keyLessons: [
      "La usabilidad es fundamental para la adopción ciudadana",
      "La interoperabilidad entre sistemas mejora la experiencia",
      "La alfabetización digital debe acompañar la implementación"
    ],
    tags: ["gobierno electrónico", "digitalización", "ciudadanía digital", "servicios públicos"]
  },
  {
    title: "Revista Centroamericana de Administración Pública",
    description: "Publicación académica que documenta experiencias en administración pública centroamericana con casos de Costa Rica",
    country: "Costa Rica/Centroamérica",
    institution: "Instituto Centroamericano de Administración Pública (ICAP)",
    year: 2022,
    sourceUrl: "https://ojs.icap.ac.cr/index.php/RCAP/issue/view/15/17",
    sourceType: "web",
    targetCriteria: ["Administración pública", "Planificación regional", "Capacitación institucional"],
    results: "Sistematización de 20 experiencias exitosas en gestión pública regional con indicadores de impacto",
    keyLessons: [
      "La cooperación regional fortalece las capacidades institucionales",
      "Los programas de capacitación deben ser contextualizados",
      "El intercambio de experiencias acelera el aprendizaje"
    ],
    tags: ["administración pública", "Centroamérica", "ICAP", "cooperación regional"]
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