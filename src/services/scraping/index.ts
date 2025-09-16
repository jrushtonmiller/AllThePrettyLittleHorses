// Scraping framework for Equine Intelligence FEI Champion Predictor
// Implements the scraping blueprint with compliance and hygiene

import { DataSource, ScrapingJob } from '../../types/database';

export class ScrapingEngine {
  private sources: Map<string, DataSource> = new Map();
  private jobs: Map<string, ScrapingJob> = new Map();
  private rateLimiters: Map<string, number> = new Map();

  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    // FEI Data Source
    this.sources.set('fei', {
      name: 'FEI',
      base_url: 'https://data.fei.org',
      rate_limit_ms: 1000, // 1 second between requests
      robots_txt_url: 'https://data.fei.org/robots.txt',
      authentication_required: false,
      status: 'active'
    });

    // USEF Data Source
    this.sources.set('usef', {
      name: 'USEF',
      base_url: 'https://www.usef.org',
      rate_limit_ms: 2000, // 2 seconds between requests
      robots_txt_url: 'https://www.usef.org/robots.txt',
      authentication_required: false,
      status: 'active'
    });

    // ShowGroundsLive Data Source
    this.sources.set('sgl', {
      name: 'ShowGroundsLive',
      base_url: 'https://www.showgroundslive.com',
      rate_limit_ms: 1500, // 1.5 seconds between requests
      robots_txt_url: 'https://www.showgroundslive.com/robots.txt',
      authentication_required: false,
      status: 'active'
    });
  }

  // Compliance & Hygiene Methods
  async checkRobotsTxt(source: string): Promise<boolean> {
    const dataSource = this.sources.get(source);
    if (!dataSource) return false;

    try {
      const response = await fetch(dataSource.robots_txt_url);
      const robotsTxt = await response.text();
      
      // Basic robots.txt compliance check
      // In production, use a proper robots.txt parser
      return !robotsTxt.includes('Disallow: /');
    } catch (error) {
      console.warn(`Could not fetch robots.txt for ${source}:`, error);
      return true; // Allow if can't check
    }
  }

  async respectRateLimit(source: string): Promise<void> {
    const dataSource = this.sources.get(source);
    if (!dataSource) return;

    const lastRequest = this.rateLimiters.get(source) || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    
    if (timeSinceLastRequest < dataSource.rate_limit_ms) {
      const waitTime = dataSource.rate_limit_ms - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.rateLimiters.set(source, Date.now());
  }

  // Core Scraping Methods
  async scrapeFEIRankings(year: number, discipline: string = 'Show Jumping') {
    const jobId = `fei_rankings_${year}_${discipline}`;
    
    const job: ScrapingJob = {
      job_id: jobId,
      source: 'fei',
      target_type: 'rankings',
      date_range: {
        start: `${year}-01-01`,
        end: `${year}-12-31`
      },
      status: 'running',
      created_at: new Date().toISOString(),
      records_processed: 0,
      errors: []
    };

    this.jobs.set(jobId, job);

    try {
      await this.respectRateLimit('fei');
      const canScrape = await this.checkRobotsTxt('fei');
      
      if (!canScrape) {
        throw new Error('Robots.txt disallows scraping');
      }

      // FEI Rankings URL structure
      const url = `https://data.fei.org/Ranking/Search.aspx?rankingCode=WS${year}`;
      
      // In production, implement actual scraping logic
      console.log(`Scraping FEI rankings from: ${url}`);
      
      // Simulate successful scraping
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.records_processed = 100; // Simulated
      
    } catch (error) {
      job.status = 'failed';
      job.errors?.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('FEI scraping failed:', error);
    }

    return job;
  }

  async scrapeUSEFResults(showName?: string, dateRange?: {start: string, end: string}) {
    const jobId = `usef_results_${Date.now()}`;
    
    const job: ScrapingJob = {
      job_id: jobId,
      source: 'usef',
      target_type: 'results',
      date_range: dateRange || {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      status: 'running',
      created_at: new Date().toISOString(),
      records_processed: 0,
      errors: []
    };

    this.jobs.set(jobId, job);

    try {
      await this.respectRateLimit('usef');
      
      // USEF Results URL structure
      const baseUrl = 'https://www.usef.org/compete/resources-forms/competitions/results';
      
      console.log(`Scraping USEF results from: ${baseUrl}`);
      
      // Simulate successful scraping
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.records_processed = 500; // Simulated
      
    } catch (error) {
      job.status = 'failed';
      job.errors?.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('USEF scraping failed:', error);
    }

    return job;
  }

  async scrapeSGLResults(eventName?: string, dateRange?: {start: string, end: string}) {
    const jobId = `sgl_results_${Date.now()}`;
    
    const job: ScrapingJob = {
      job_id: jobId,
      source: 'sgl',
      target_type: 'results',
      date_range: dateRange || {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      status: 'running',
      created_at: new Date().toISOString(),
      records_processed: 0,
      errors: []
    };

    this.jobs.set(jobId, job);

    try {
      await this.respectRateLimit('sgl');
      
      // ShowGroundsLive Results URL structure
      const baseUrl = 'https://www.showgroundslive.com/results';
      
      console.log(`Scraping ShowGroundsLive results from: ${baseUrl}`);
      
      // Simulate successful scraping
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.records_processed = 1000; // Simulated
      
    } catch (error) {
      job.status = 'failed';
      job.errors?.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('SGL scraping failed:', error);
    }

    return job;
  }

  // Status Mapping (unified)
  mapStatus(rawStatus: string): 'Placed' | 'R' | 'E' | 'DNP' {
    const status = rawStatus.trim().toLowerCase();
    
    if (['retired', 'ret', 'rt'].includes(status)) return 'R';
    if (['eliminated', 'el'].includes(status)) return 'E';
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(status)) return 'Placed';
    if (['wd', 'scr', 'dns'].includes(status)) {
      throw new Error('Pre-start withdrawals excluded from analysis');
    }
    
    return 'DNP'; // Default for finished but out of placings
  }

  // Normalization Methods
  normalizeDate(dateStr: string): string {
    // Convert various date formats to YYYY-MM-DD
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  normalizeHeight(heightInches: number): number {
    // Convert inches to cm
    return heightInches * 2.54;
  }

  normalizeHeightFromHands(hands: number): number {
    // Convert hands to cm (1 hand = 4 inches = 10.16 cm)
    return hands * 10.16;
  }

  // Identity Resolution
  generateHorseId(name: string, dob: string, registrationNumber?: string): string {
    if (registrationNumber) {
      return `reg_${registrationNumber}`;
    }
    
    // Create hash from name + dob for provisional ID
    const hash = this.simpleHash(name + dob);
    return `provisional_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Job Management
  getJobStatus(jobId: string): ScrapingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScrapingJob[] {
    return Array.from(this.jobs.values());
  }

  getActiveJobs(): ScrapingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === 'running');
  }

  // Data Source Management
  getDataSource(source: string): DataSource | undefined {
    return this.sources.get(source);
  }

  getAllDataSources(): DataSource[] {
    return Array.from(this.sources.values());
  }
}

// Export singleton instance
export const scrapingEngine = new ScrapingEngine();
