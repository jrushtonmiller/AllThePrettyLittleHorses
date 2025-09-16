// Real USEF Data Scraping Implementation
// Scrapes actual data from USEF website

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Horse, Result, Event } from '../../types/database';

export class USEFScraper {
  private readonly baseUrl = 'https://www.usef.org';
  private readonly userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 3000; // 3 seconds between requests

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.delay(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.rateLimit();
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 30000,
        });
        
        return response.data;
      } catch (error: any) {
        console.warn(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
        if (i === retries - 1) throw error;
        await this.delay(1000 * (i + 1)); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Scrape USEF competition results
  async scrapeCompetitionResults(showName?: string, dateRange?: {start: string, end: string}): Promise<Result[]> {
    try {
      console.log(`Scraping USEF competition results for ${showName || 'all shows'}...`);
      
      // USEF Results URL - this is a simplified approach
      // In reality, USEF has complex search forms that might require POST requests
      const url = `${this.baseUrl}/compete/resources-forms/competitions/results`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const results: Result[] = [];
      
      // Parse results - this would need to be adapted based on actual USEF page structure
      $('table.results-table tbody tr, .result-row').each((index, element) => {
        const $row = $(element);
        
        // Extract result data - these selectors would need to be updated based on actual HTML
        const horseName = $row.find('.horse-name, td:nth-child(2)').text().trim();
        const riderName = $row.find('.rider-name, td:nth-child(3)').text().trim();
        const placing = $row.find('.placing, td:nth-child(1)').text().trim();
        const faults = $row.find('.faults, td:nth-child(4)').text().trim();
        const time = $row.find('.time, td:nth-child(5)').text().trim();
        const earnings = $row.find('.earnings, td:nth-child(6)').text().trim();
        const eventName = $row.find('.event-name, td:nth-child(7)').text().trim();
        const className = $row.find('.class-name, td:nth-child(8)').text().trim();
        const date = $row.find('.date, td:nth-child(9)').text().trim();
        
        // Parse placing
        let parsedPlacing = 0;
        if (placing && !isNaN(parseInt(placing))) {
          parsedPlacing = parseInt(placing);
        }
        
        // Parse faults
        let parsedFaults = 0;
        if (faults && !isNaN(parseFloat(faults))) {
          parsedFaults = parseFloat(faults);
        }
        
        // Parse time to seconds
        let timeSeconds = 0;
        if (time) {
          const timeMatch = time.match(/(\d+):(\d+\.?\d*)/);
          if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseFloat(timeMatch[2]);
            timeSeconds = minutes * 60 + seconds;
          }
        }
        
        // Parse earnings
        let earningsUsd = 0;
        if (earnings) {
          const earningsMatch = earnings.replace(/[^0-9.-]/g, '');
          if (earningsMatch && !isNaN(parseFloat(earningsMatch))) {
            earningsUsd = parseFloat(earningsMatch);
          }
        }
        
        // Parse date
        let parsedDate = '';
        if (date) {
          const dateMatch = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        // Determine status
        let resultStatus: 'Placed' | 'DNP' | 'R' | 'E' | 'WD' = 'Placed';
        if (placing.toLowerCase().includes('retired') || placing.toLowerCase().includes('ret')) {
          resultStatus = 'R';
        } else if (placing.toLowerCase().includes('eliminated') || placing.toLowerCase().includes('elim')) {
          resultStatus = 'E';
        } else if (placing.toLowerCase().includes('withdrawn') || placing.toLowerCase().includes('wd')) {
          resultStatus = 'WD';
        } else if (placing.toLowerCase().includes('dnp') || placing.toLowerCase().includes('did not place')) {
          resultStatus = 'DNP';
        }
        
        if (horseName && eventName) {
          const result: Result = {
            result_id: `USEF_${horseName.replace(/\s+/g, '_')}_${eventName}_${parsedDate}`,
            horse_id: `USEF_${horseName.replace(/\s+/g, '_')}`,
            class_id: `USEF_CLASS_${eventName}_${className}`,
            placing: parsedPlacing,
            status: resultStatus,
            faults: parsedFaults,
            time_seconds: timeSeconds,
            earnings_usd: earningsUsd,
            source: 'USEF',
            result_raw_status: placing,
            class_height_cm: 0 // Would need to extract from class name
          };
          
          results.push(result);
        }
      });
      
      console.log(`Found ${results.length} USEF results`);
      return results;
      
    } catch (error) {
      console.error('Error scraping USEF competition results:', error);
      return [];
    }
  }

  // Scrape USEF shows/events
  async scrapeShows(): Promise<Event[]> {
    try {
      console.log('Scraping USEF shows...');
      
      const url = `${this.baseUrl}/compete/resources-forms/competitions`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const events: Event[] = [];
      
      // Parse shows - this would need to be adapted based on actual USEF page structure
      $('table.shows-table tbody tr, .show-row').each((index, element) => {
        const $row = $(element);
        
        const name = $row.find('.show-name, td:nth-child(1)').text().trim();
        const venue = $row.find('.venue, td:nth-child(2)').text().trim();
        const location = $row.find('.location, td:nth-child(3)').text().trim();
        const startDate = $row.find('.start-date, td:nth-child(4)').text().trim();
        const endDate = $row.find('.end-date, td:nth-child(5)').text().trim();
        
        // Parse start date
        let parsedStartDate = '';
        if (startDate) {
          const dateMatch = startDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            parsedStartDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        if (name && parsedStartDate) {
          const event: Event = {
            event_id: `USEF_${name.replace(/\s+/g, '_')}_${parsedStartDate}`,
            name,
            venue: venue || '',
            location: location || '',
            start_date: parsedStartDate,
            federation: 'USEF'
          };
          
          events.push(event);
        }
      });
      
      console.log(`Found ${events.length} USEF shows`);
      return events;
      
    } catch (error) {
      console.error('Error scraping USEF shows:', error);
      return [];
    }
  }

  // Search for horses by name
  async searchHorsesByName(horseName: string): Promise<Horse[]> {
    try {
      console.log(`Searching USEF horses by name: ${horseName}`);
      
      // USEF horse search - this would need to be adapted based on actual search functionality
      const url = `${this.baseUrl}/compete/resources-forms/horses/search?name=${encodeURIComponent(horseName)}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const horses: Horse[] = [];
      
      // Parse search results
      $('table.horse-search-results tbody tr, .horse-result').each((index, element) => {
        const $row = $(element);
        
        const name = $row.find('.horse-name, td:nth-child(1)').text().trim();
        const breed = $row.find('.breed, td:nth-child(2)').text().trim();
        const country = $row.find('.country, td:nth-child(3)').text().trim();
        const dob = $row.find('.dob, td:nth-child(4)').text().trim();
        const sex = $row.find('.sex, td:nth-child(5)').text().trim();
        const color = $row.find('.color, td:nth-child(6)').text().trim();
        const height = $row.find('.height, td:nth-child(7)').text().trim();
        
        // Extract USEF ID from link
        const horseLink = $row.find('a').attr('href');
        const usefId = horseLink ? horseLink.match(/horseId=(\d+)/)?.[1] : null;
        
        // Parse height to cm
        let heightCm = 0;
        if (height) {
          const heightMatch = height.match(/(\d+)\s*cm/i);
          if (heightMatch) {
            heightCm = parseInt(heightMatch[1]);
          } else {
            const inchesMatch = height.match(/(\d+)\s*in/i);
            if (inchesMatch) {
              heightCm = Math.round(parseInt(inchesMatch[1]) * 2.54);
            }
          }
        }
        
        // Parse date of birth
        let parsedDob = '';
        if (dob) {
          const dateMatch = dob.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            parsedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        if (name) {
          const horse: Horse = {
            horse_id: usefId || `USEF_${name.replace(/\s+/g, '_')}`,
            name,
            breed: breed || 'Unknown',
            country: country || 'USA',
            dob: parsedDob,
            sex: sex || '',
            height_cm: heightCm,
            color: color || '',
            sire_name: '', // Not available in search results
            dam_name: '', // Not available in search results
            usef_id: usefId,
            source: 'USEF'
          };
          
          horses.push(horse);
        }
      });
      
      console.log(`Found ${horses.length} USEF horses matching: ${horseName}`);
      return horses;
      
    } catch (error) {
      console.error(`Error searching USEF horses by name ${horseName}:`, error);
      return [];
    }
  }

  // Scrape USEF rankings
  async scrapeRankings(discipline: string = 'Show Jumping', year: number = 2024): Promise<any[]> {
    try {
      console.log(`Scraping USEF rankings for ${discipline} ${year}...`);
      
      const url = `${this.baseUrl}/compete/resources-forms/rankings/${discipline.toLowerCase().replace(' ', '-')}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const rankings: any[] = [];
      
      // Parse rankings table
      $('table.rankings-table tbody tr, .ranking-row').each((index, element) => {
        const $row = $(element);
        
        const rank = $row.find('.rank, td:nth-child(1)').text().trim();
        const horseName = $row.find('.horse-name, td:nth-child(2)').text().trim();
        const riderName = $row.find('.rider-name, td:nth-child(3)').text().trim();
        const points = $row.find('.points, td:nth-child(4)').text().trim();
        
        if (horseName && !isNaN(parseInt(rank))) {
          rankings.push({
            rank: parseInt(rank),
            horse_name: horseName,
            rider_name: riderName,
            points: points ? parseInt(points.replace(/,/g, '')) : 0,
            discipline,
            year,
            source: 'USEF'
          });
        }
      });
      
      console.log(`Found ${rankings.length} USEF rankings for ${discipline} ${year}`);
      return rankings;
      
    } catch (error) {
      console.error(`Error scraping USEF rankings for ${discipline}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const usefScraper = new USEFScraper();
