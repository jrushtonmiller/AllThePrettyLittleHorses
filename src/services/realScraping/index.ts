// Unified Real Scraping Service
// Integrates all real scrapers and provides a unified interface

import { feiScraper } from './feiScraper';
import { usefScraper } from './usefScraper';
import { showGroundsLiveScraper } from './showgroundsliveScraper';
import { Horse, Result, Event, FEIRanking } from '../../types/database';
import axios from 'axios';

export interface ScrapingOptions {
  year?: number;
  discipline?: string;
  showName?: string;
  dateRange?: { start: string; end: string };
  maxResults?: number;
}

export interface ScrapingResults {
  horses: Horse[];
  results: Result[];
  events: Event[];
  rankings: FEIRanking[];
  summary: {
    totalHorses: number;
    totalResults: number;
    totalEvents: number;
    totalRankings: number;
    sources: string[];
    lastUpdated: string;
    errors: string[];
  };
}

export class RealScrapingService {
  private static instance: RealScrapingService;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly BACKEND_URL = 'http://localhost:3001/api';

  private constructor() {}

  public static getInstance(): RealScrapingService {
    if (!RealScrapingService.instance) {
      RealScrapingService.instance = new RealScrapingService();
    }
    return RealScrapingService.instance;
  }

  // Cache management
  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    setTimeout(() => {
      this.cache.delete(key);
    }, this.CACHE_DURATION);
  }

  private getCache(key: string): any {
    return this.cache.get(key);
  }

  // Backend API methods (CORS-free)
  async scrapeAllSourcesViaBackend(options: ScrapingOptions = {}): Promise<ScrapingResults> {
    const cacheKey = `backend_all_sources_${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log('🚀 Starting REAL scraping via backend API (no CORS issues)...');
    
    const allHorses: Horse[] = [];
    const allResults: Result[] = [];
    const allEvents: Event[] = [];
    const allRankings: FEIRanking[] = [];
    const errors: string[] = [];
    const sources: string[] = [];

    try {
      // Check if backend is running
      try {
        await axios.get(`${this.BACKEND_URL}/health`, { timeout: 5000 });
        console.log('✅ Backend server is running');
      } catch (error) {
        throw new Error('Backend server is not running. Please start it with: cd backend && npm start');
      }

      // Scrape FEI data via backend
      console.log('📡 Scraping FEI data via backend...');
      try {
        const response = await axios.get(`${this.BACKEND_URL}/scrape/fei/rankings`, {
          params: {
            year: options.year || 2024,
            discipline: options.discipline || 'Show Jumping'
          },
          timeout: 30000
        });
        
        if (response.data.success) {
          allRankings.push(...response.data.data);
          sources.push('FEI');
          console.log(`✅ FEI: Found ${response.data.data.length} rankings`);
        } else {
          errors.push(`FEI: ${response.data.error}`);
        }
      } catch (error: any) {
        errors.push(`FEI: ${error.message}`);
        console.error('FEI backend scraping error:', error);
      }

      // Scrape USEF data via backend
      console.log('📡 Scraping USEF data via backend...');
      try {
        const response = await axios.get(`${this.BACKEND_URL}/scrape/usef/results`, {
          timeout: 30000
        });
        
        if (response.data.success) {
          allResults.push(...response.data.data);
          sources.push('USEF');
          console.log(`✅ USEF: Found ${response.data.data.length} results`);
        } else {
          errors.push(`USEF: ${response.data.error}`);
        }
      } catch (error: any) {
        errors.push(`USEF: ${error.message}`);
        console.error('USEF backend scraping error:', error);
      }

      // Scrape ShowGroundsLive data via backend
      console.log('📡 Scraping ShowGroundsLive data via backend...');
      try {
        const response = await axios.get(`${this.BACKEND_URL}/scrape/sgl/results`, {
          timeout: 30000
        });
        
        if (response.data.success) {
          allResults.push(...response.data.data);
          sources.push('ShowGroundsLive');
          console.log(`✅ ShowGroundsLive: Found ${response.data.data.length} results`);
        } else {
          errors.push(`ShowGroundsLive: ${response.data.error}`);
        }
      } catch (error: any) {
        errors.push(`ShowGroundsLive: ${error.message}`);
        console.error('ShowGroundsLive backend scraping error:', error);
      }

    } catch (error: any) {
      errors.push(`Backend connection: ${error.message}`);
      console.error('Backend connection error:', error);
    }

    const results: ScrapingResults = {
      horses: allHorses,
      results: allResults,
      events: allEvents,
      rankings: allRankings,
      summary: {
        totalHorses: allHorses.length,
        totalResults: allResults.length,
        totalEvents: allEvents.length,
        totalRankings: allRankings.length,
        sources,
        lastUpdated: new Date().toISOString(),
        errors
      }
    };

    this.setCache(cacheKey, results);
    return results;
  }

  // Main scraping methods (fallback to direct scraping)
  async scrapeAllSources(options: ScrapingOptions = {}): Promise<ScrapingResults> {
    const cacheKey = `all_sources_${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log('Starting real scraping from all sources...');
    
    const allHorses: Horse[] = [];
    const allResults: Result[] = [];
    const allEvents: Event[] = [];
    const allRankings: FEIRanking[] = [];
    const errors: string[] = [];
    const sources: string[] = [];

    try {
      // Scrape FEI data
      console.log('Scraping FEI data...');
      try {
        const feiRankings = await feiScraper.scrapeWorldRankings(options.year, options.discipline);
        allRankings.push(...feiRankings);
        sources.push('FEI');
        console.log(`FEI: Found ${feiRankings.length} rankings`);
      } catch (error: any) {
        errors.push(`FEI: ${error.message}`);
        console.error('FEI scraping error:', error);
      }

      // Scrape USEF data
      console.log('Scraping USEF data...');
      try {
        const [usefResults, usefEvents, usefRankings] = await Promise.all([
          usefScraper.scrapeCompetitionResults(options.showName, options.dateRange),
          usefScraper.scrapeShows(),
          usefScraper.scrapeRankings(options.discipline, options.year)
        ]);
        
        allResults.push(...usefResults);
        allEvents.push(...usefEvents);
        sources.push('USEF');
        console.log(`USEF: Found ${usefResults.length} results, ${usefEvents.length} events, ${usefRankings.length} rankings`);
      } catch (error: any) {
        errors.push(`USEF: ${error.message}`);
        console.error('USEF scraping error:', error);
      }

      // Scrape ShowGroundsLive data
      console.log('Scraping ShowGroundsLive data...');
      try {
        const [sglResults, sglEvents] = await Promise.all([
          showGroundsLiveScraper.scrapeCompetitionResults(options.showName, options.dateRange),
          showGroundsLiveScraper.scrapeShows()
        ]);
        
        allResults.push(...sglResults);
        allEvents.push(...sglEvents);
        sources.push('ShowGroundsLive');
        console.log(`ShowGroundsLive: Found ${sglResults.length} results, ${sglEvents.length} events`);
      } catch (error: any) {
        errors.push(`ShowGroundsLive: ${error.message}`);
        console.error('ShowGroundsLive scraping error:', error);
      }

    } catch (error: any) {
      errors.push(`General: ${error.message}`);
      console.error('General scraping error:', error);
    }

    const results: ScrapingResults = {
      horses: allHorses,
      results: allResults,
      events: allEvents,
      rankings: allRankings,
      summary: {
        totalHorses: allHorses.length,
        totalResults: allResults.length,
        totalEvents: allEvents.length,
        totalRankings: allRankings.length,
        sources,
        lastUpdated: new Date().toISOString(),
        errors
      }
    };

    this.setCache(cacheKey, results);
    return results;
  }

  // Search for horses across all sources
  async searchHorsesByName(horseName: string): Promise<Horse[]> {
    const cacheKey = `horse_search_${horseName}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log(`Searching for horse: ${horseName} across all sources...`);
    
    const allHorses: Horse[] = [];
    const errors: string[] = [];

    try {
      // Search FEI
      try {
        const feiHorses = await feiScraper.searchHorsesByName(horseName);
        allHorses.push(...feiHorses);
        console.log(`FEI: Found ${feiHorses.length} horses`);
      } catch (error: any) {
        errors.push(`FEI search: ${error.message}`);
        console.error('FEI search error:', error);
      }

      // Search USEF
      try {
        const usefHorses = await usefScraper.searchHorsesByName(horseName);
        allHorses.push(...usefHorses);
        console.log(`USEF: Found ${usefHorses.length} horses`);
      } catch (error: any) {
        errors.push(`USEF search: ${error.message}`);
        console.error('USEF search error:', error);
      }

      // Search ShowGroundsLive
      try {
        const sglHorses = await showGroundsLiveScraper.searchHorsesByName(horseName);
        allHorses.push(...sglHorses);
        console.log(`ShowGroundsLive: Found ${sglHorses.length} horses`);
      } catch (error: any) {
        errors.push(`ShowGroundsLive search: ${error.message}`);
        console.error('ShowGroundsLive search error:', error);
      }

    } catch (error: any) {
      errors.push(`General search: ${error.message}`);
      console.error('General search error:', error);
    }

    // Remove duplicates based on name and source
    const uniqueHorses = allHorses.filter((horse, index, self) => 
      index === self.findIndex(h => h.name === horse.name && h.source === horse.source)
    );

    console.log(`Found ${uniqueHorses.length} unique horses for: ${horseName}`);
    if (errors.length > 0) {
      console.warn('Search errors:', errors);
    }

    this.setCache(cacheKey, uniqueHorses);
    return uniqueHorses;
  }

  // Get detailed horse information
  async getHorseDetails(horseId: string, source: string): Promise<Horse | null> {
    const cacheKey = `horse_details_${horseId}_${source}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log(`Getting detailed horse information for: ${horseId} from ${source}`);

    try {
      let horse: Horse | null = null;

      switch (source) {
        case 'FEI':
          horse = await feiScraper.scrapeHorseDetails(horseId);
          break;
        case 'USEF':
          // USEF doesn't have detailed horse pages in the same way
          // We'd need to implement this based on their actual structure
          console.log('USEF detailed horse info not implemented yet');
          break;
        case 'ShowGroundsLive':
          // ShowGroundsLive doesn't have detailed horse pages
          console.log('ShowGroundsLive detailed horse info not implemented yet');
          break;
        default:
          console.warn(`Unknown source for horse details: ${source}`);
      }

      if (horse) {
        this.setCache(cacheKey, horse);
        console.log(`Successfully retrieved horse details for: ${horse.name}`);
      }

      return horse;

    } catch (error: any) {
      console.error(`Error getting horse details for ${horseId} from ${source}:`, error);
      return null;
    }
  }

  // Get horse competition results
  async getHorseResults(horseId: string, source: string, year?: number): Promise<Result[]> {
    const cacheKey = `horse_results_${horseId}_${source}_${year || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log(`Getting competition results for: ${horseId} from ${source}`);

    try {
      let results: Result[] = [];

      switch (source) {
        case 'FEI':
          results = await feiScraper.scrapeHorseResults(horseId, year);
          break;
        case 'USEF':
          // USEF results would need to be filtered by horse
          console.log('USEF horse-specific results not implemented yet');
          break;
        case 'ShowGroundsLive':
          // ShowGroundsLive results would need to be filtered by horse
          console.log('ShowGroundsLive horse-specific results not implemented yet');
          break;
        default:
          console.warn(`Unknown source for horse results: ${source}`);
      }

      console.log(`Found ${results.length} results for horse: ${horseId}`);
      this.setCache(cacheKey, results);
      return results;

    } catch (error: any) {
      console.error(`Error getting horse results for ${horseId} from ${source}:`, error);
      return [];
    }
  }

  // Get events from all sources
  async getAllEvents(year?: number): Promise<Event[]> {
    const cacheKey = `all_events_${year || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log(`Getting events from all sources for year: ${year || 'all'}`);

    const allEvents: Event[] = [];
    const errors: string[] = [];

    try {
      // Get FEI events
      try {
        const feiEvents = await feiScraper.scrapeEvents(year);
        allEvents.push(...feiEvents);
        console.log(`FEI: Found ${feiEvents.length} events`);
      } catch (error: any) {
        errors.push(`FEI events: ${error.message}`);
        console.error('FEI events error:', error);
      }

      // Get USEF events
      try {
        const usefEvents = await usefScraper.scrapeShows();
        allEvents.push(...usefEvents);
        console.log(`USEF: Found ${usefEvents.length} events`);
      } catch (error: any) {
        errors.push(`USEF events: ${error.message}`);
        console.error('USEF events error:', error);
      }

      // Get ShowGroundsLive events
      try {
        const sglEvents = await showGroundsLiveScraper.scrapeShows();
        allEvents.push(...sglEvents);
        console.log(`ShowGroundsLive: Found ${sglEvents.length} events`);
      } catch (error: any) {
        errors.push(`ShowGroundsLive events: ${error.message}`);
        console.error('ShowGroundsLive events error:', error);
      }

    } catch (error: any) {
      errors.push(`General events: ${error.message}`);
      console.error('General events error:', error);
    }

    // Remove duplicates based on name and date
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.start_date === event.start_date)
    );

    console.log(`Found ${uniqueEvents.length} unique events`);
    if (errors.length > 0) {
      console.warn('Event scraping errors:', errors);
    }

    this.setCache(cacheKey, uniqueEvents);
    return uniqueEvents;
  }

  // Get rankings from all sources
  async getAllRankings(year?: number, discipline?: string): Promise<FEIRanking[]> {
    const cacheKey = `all_rankings_${year || 'all'}_${discipline || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    console.log(`Getting rankings from all sources for year: ${year || 'all'}, discipline: ${discipline || 'all'}`);

    const allRankings: FEIRanking[] = [];
    const errors: string[] = [];

    try {
      // Get FEI rankings
      try {
        const feiRankings = await feiScraper.scrapeWorldRankings(year, discipline);
        allRankings.push(...feiRankings);
        console.log(`FEI: Found ${feiRankings.length} rankings`);
      } catch (error: any) {
        errors.push(`FEI rankings: ${error.message}`);
        console.error('FEI rankings error:', error);
      }

      // Get USEF rankings
      try {
        const usefRankings = await usefScraper.scrapeRankings(discipline, year);
        // Convert USEF rankings to FEIRanking format
        const convertedRankings: FEIRanking[] = usefRankings.map(ranking => ({
          horse_id: `USEF_${ranking.horse_name.replace(/\s+/g, '_')}`,
          year: ranking.year,
          discipline: ranking.discipline,
          rank_position: ranking.rank,
          present_flag: true,
          horse_name: ranking.horse_name,
          rider_name: ranking.rider_name,
          points: ranking.points,
          source: 'USEF'
        }));
        allRankings.push(...convertedRankings);
        console.log(`USEF: Found ${usefRankings.length} rankings`);
      } catch (error: any) {
        errors.push(`USEF rankings: ${error.message}`);
        console.error('USEF rankings error:', error);
      }

    } catch (error: any) {
      errors.push(`General rankings: ${error.message}`);
      console.error('General rankings error:', error);
    }

    console.log(`Found ${allRankings.length} total rankings`);
    if (errors.length > 0) {
      console.warn('Rankings scraping errors:', errors);
    }

    this.setCache(cacheKey, allRankings);
    return allRankings;
  }

  // Get scraping status and statistics
  async getScrapingStatus(): Promise<{
    isActive: boolean;
    lastScrapingTime: string;
    cacheSize: number;
    availableSources: string[];
    errors: string[];
  }> {
    return {
      isActive: true,
      lastScrapingTime: new Date().toISOString(),
      cacheSize: this.cache.size,
      availableSources: ['FEI', 'USEF', 'ShowGroundsLive'],
      errors: []
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    console.log('Scraping cache cleared');
  }
}

// Export singleton instance
export const realScrapingService = RealScrapingService.getInstance();
