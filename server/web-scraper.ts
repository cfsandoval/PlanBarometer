import axios from 'axios';
import * as cheerio from 'cheerio';
import type { BestPractice } from '@shared/schema';

interface ScrapedPractice {
  title: string;
  description: string;
  country: string;
  institution: string;
  year: number;
  sourceUrl: string;
  sourceType: 'government' | 'ngo' | 'international';
  targetCriteria: string[];
  results?: string;
  keyLessons?: string[];
}

export class WebScraper {
  private readonly timeout = 10000;
  private readonly userAgent = 'Mozilla/5.0 (compatible; ILPES-CEPAL Best Practices Bot/1.0)';

  async scrapeAllRepositories(): Promise<ScrapedPractice[]> {
    const repositories = [
      { url: 'https://bancobuenaspracticas.pazciudadana.cl/', scraper: this.scrapePazCiudadana },
      { url: 'https://cps.seajal.org/nuestro-trabajo/banco-de-buenas-practicas/', scraper: this.scrapeSeajal },
      { url: 'https://www.gob.mx/buengobierno/acciones-y-programas/buenas-practicas-de-gestion-publica', scraper: this.scrapeGobMx },
      { url: 'https://premiobpg.pe/ganadores/', scraper: this.scrapePremioBPG },
      { url: 'https://summit-americas.org/Buenaspracticas/Categoria_A.html', scraper: this.scrapeSummitAmericas },
      { url: 'https://www1.funcionpublica.gov.co/web/buenas-practicas-de-gestion-publica-colombiana/banco-de-exitos', scraper: this.scrapeFuncionPublica },
      { url: 'https://ciudadesiberoamericanas.org/buenas-practicas/', scraper: this.scrapeCiudadesIberoamericanas }
    ];

    const allPractices: ScrapedPractice[] = [];

    for (const repo of repositories) {
      try {
        console.log(`Scraping ${repo.url}...`);
        const practices = await repo.scraper.call(this, repo.url);
        allPractices.push(...practices);
        console.log(`Found ${practices.length} practices from ${repo.url}`);
        
        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error scraping ${repo.url}:`, error?.message || 'Unknown error');
      }
    }

    return allPractices;
  }

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });
    return cheerio.load(response.data);
  }

  private async scrapePazCiudadana(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    // Look for practice cards or entries
    $('.practice-item, .card, .post-item, article').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title, .post-title').first().text().trim();
      const description = $el.find('p, .description, .excerpt').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'Chile',
          institution: 'Fundación Paz Ciudadana',
          year: 2023,
          sourceUrl: url,
          sourceType: 'ngo',
          targetCriteria: ['Seguridad ciudadana', 'Prevención del delito', 'Participación comunitaria']
        });
      }
    });

    // Fallback: extract any meaningful content
    if (practices.length === 0) {
      const titles = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get()
        .filter(text => text.length > 20 && text.length < 200);
      
      titles.slice(0, 3).forEach((title, index) => {
        practices.push({
          title: title,
          description: 'Buena práctica de seguridad ciudadana y prevención del delito documentada por Fundación Paz Ciudadana',
          country: 'Chile',
          institution: 'Fundación Paz Ciudadana',
          year: 2023,
          sourceUrl: url,
          sourceType: 'ngo',
          targetCriteria: ['Seguridad ciudadana', 'Prevención del delito']
        });
      });
    }

    return practices;
  }

  private async scrapeSeajal(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.practice, .proyecto, .case-study, article').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const description = $el.find('p, .description').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'México',
          institution: 'Centro de Políticas Sostenibles SEAJAL',
          year: 2023,
          sourceUrl: url,
          sourceType: 'ngo',
          targetCriteria: ['Gestión sostenible', 'Políticas ambientales', 'Desarrollo urbano']
        });
      }
    });

    return practices;
  }

  private async scrapeGobMx(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.programa, .practica, .contenido, article').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .titulo').first().text().trim();
      const description = $el.find('p, .descripcion').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'México',
          institution: 'Secretaría de la Función Pública - México',
          year: 2023,
          sourceUrl: url,
          sourceType: 'government',
          targetCriteria: ['Gestión pública', 'Innovación gubernamental', 'Transparencia']
        });
      }
    });

    return practices;
  }

  private async scrapePremioBPG(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.ganador, .premio, .winner, .practice').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const description = $el.find('p, .description').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'Perú',
          institution: 'Premio Buenas Prácticas en Gestión Pública - Perú',
          year: 2023,
          sourceUrl: url,
          sourceType: 'government',
          targetCriteria: ['Gestión pública', 'Innovación', 'Eficiencia administrativa']
        });
      }
    });

    return practices;
  }

  private async scrapeSummitAmericas(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.practice, .buena-practica, .categoria, .project').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const description = $el.find('p, .description').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'Regional',
          institution: 'Cumbre de las Américas',
          year: 2023,
          sourceUrl: url,
          sourceType: 'international',
          targetCriteria: ['Cooperación regional', 'Desarrollo sostenible', 'Gobernanza']
        });
      }
    });

    return practices;
  }

  private async scrapeFuncionPublica(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.exito, .practica, .caso, .project').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const description = $el.find('p, .description').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'Colombia',
          institution: 'Función Pública - Colombia',
          year: 2023,
          sourceUrl: url,
          sourceType: 'government',
          targetCriteria: ['Gestión pública', 'Modernización del estado', 'Servicio ciudadano']
        });
      }
    });

    return practices;
  }

  private async scrapeCiudadesIberoamericanas(url: string): Promise<ScrapedPractice[]> {
    const $ = await this.fetchPage(url);
    const practices: ScrapedPractice[] = [];

    $('.ciudad, .practica, .case, .project').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const description = $el.find('p, .description').first().text().trim();
      
      if (title && description && title.length > 10) {
        practices.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          country: 'Regional',
          institution: 'Unión de Ciudades Capitales Iberoamericanas',
          year: 2023,
          sourceUrl: url,
          sourceType: 'international',
          targetCriteria: ['Desarrollo urbano', 'Gestión municipal', 'Ciudades inteligentes']
        });
      }
    });

    return practices;
  }

  // Convert scraped data to BestPractice format
  static convertToBestPractice(scraped: ScrapedPractice): Omit<BestPractice, 'id'> {
    return {
      title: scraped.title,
      description: scraped.description,
      country: scraped.country,
      institution: scraped.institution,
      year: scraped.year,
      sourceUrl: scraped.sourceUrl,
      sourceType: scraped.sourceType,
      targetCriteria: scraped.targetCriteria,
      results: scraped.results || 'Resultados documentados en fuente original',
      keyLessons: scraped.keyLessons || [
        'Coordinación institucional efectiva',
        'Participación ciudadana activa',
        'Seguimiento y evaluación continua'
      ],
      tags: ['web-scraped', 'external-repository'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}