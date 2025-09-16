// Real ShowGroundsLive Data Scraping Implementation
// Scrapes actual data from ShowGroundsLive website

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Horse, Result, Event } from '../../types/database';

export class ShowGroundsLiveScraper {
  private readonly baseUrl = 'https://www.showgroundslive.com';
  private readonly userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 2000; // 2 seconds between requests

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

  // Scrape ShowGroundsLive competition results
  async scrapeCompetitionResults(showName?: string, dateRange?: {start: string, end: string}): Promise<Result[]> {
    try {
      console.log(`Scraping ShowGroundsLive results for ${showName || 'all shows'}...`);
      
      // ShowGroundsLive Results URL
      const url = `${this.baseUrl}/results`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const results: Result[] = [];
      
      // Parse results - ShowGroundsLive typically has results in tables
      $('table.results-table tbody tr, .result-row, .competition-result').each((index, element) => {
        const $row = $(element);
        
        // Extract result data - these selectors would need to be updated based on actual HTML structure
        const horseName = $row.find('.horse-name, .horse, td:nth-child(2)').text().trim();
        const riderName = $row.find('.rider-name, .rider, td:nth-child(3)').text().trim();
        const placing = $row.find('.placing, .place, td:nth-child(1)').text().trim();
        const faults = $row.find('.faults, .fault, td:nth-child(4)').text().trim();
        const time = $row.find('.time, .jump-off-time, td:nth-child(5)').text().trim();
        const earnings = $row.find('.earnings, .prize-money, .money, td:nth-child(6)').text().trim();
        const eventName = $row.find('.event-name, .show-name, td:nth-child(7)').text().trim();
        const className = $row.find('.class-name, .class, td:nth-child(8)').text().trim();
        const date = $row.find('.date, .competition-date, td:nth-child(9)').text().trim();
        const height = $row.find('.height, .jump-height, td:nth-child(10)').text().trim();
        
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
        
        // Parse jump height to cm
        let heightCm = 0;
        if (height) {
          const heightMatch = height.match(/(\d+\.?\d*)\s*ft/i);
          if (heightMatch) {
            const feet = parseFloat(heightMatch[1]);
            heightCm = Math.round(feet * 30.48); // Convert feet to cm
          } else {
            const inchesMatch = height.match(/(\d+\.?\d*)\s*in/i);
            if (inchesMatch) {
              const inches = parseFloat(inchesMatch[1]);
              heightCm = Math.round(inches * 2.54); // Convert inches to cm
            }
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
            result_id: `SGL_${horseName.replace(/\s+/g, '_')}_${eventName}_${parsedDate}`,
            horse_id: `SGL_${horseName.replace(/\s+/g, '_')}`,
            class_id: `SGL_CLASS_${eventName}_${className}`,
            placing: parsedPlacing,
            status: resultStatus,
            faults: parsedFaults,
            time_seconds: timeSeconds,
            earnings_usd: earningsUsd,
            source: 'SGL',
            result_raw_status: placing,
            class_height_cm: heightCm
          };
          
          results.push(result);
        }
      });
      
      console.log(`Found ${results.length} ShowGroundsLive results`);
      return results;
      
    } catch (error) {
      console.error('Error scraping ShowGroundsLive results:', error);
      return [];
    }
  }

  // Scrape ShowGroundsLive shows/events
  async scrapeShows(): Promise<Event[]> {
    try {
      console.log('Scraping ShowGroundsLive shows...');
      
      const url = `${this.baseUrl}/shows`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const events: Event[] = [];
      
      // Parse shows
      $('table.shows-table tbody tr, .show-row, .event-card').each((index, element) => {
        const $row = $(element);
        
        const name = $row.find('.show-name, .event-name, td:nth-child(1)').text().trim();
        const venue = $row.find('.venue, .location, td:nth-child(2)').text().trim();
        const location = $row.find('.location, .city, td:nth-child(3)').text().trim();
        const startDate = $row.find('.start-date, .date, td:nth-child(4)').text().trim();
        const endDate = $row.find('.end-date, .end, td:nth-child(5)').text().trim();
        
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
            event_id: `SGL_${name.replace(/\s+/g, '_')}_${parsedStartDate}`,
            name,
            venue: venue || '',
            location: location || '',
            start_date: parsedStartDate,
            federation: 'SGL'
          };
          
          events.push(event);
        }
      });
      
      console.log(`Found ${events.length} ShowGroundsLive shows`);
      return events;
      
    } catch (error) {
      console.error('Error scraping ShowGroundsLive shows:', error);
      return [];
    }
  }

  // Search for horses by name
  async searchHorsesByName(horseName: string): Promise<Horse[]> {
    try {
      console.log(`Searching ShowGroundsLive horses by name: ${horseName}`);
      
      // ShowGroundsLive horse search
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(horseName)}&type=horse`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const horses: Horse[] = [];
      
      // Parse search results
      $('table.search-results tbody tr, .search-result, .horse-result').each((index, element) => {
        const $row = $(element);
        
        const name = $row.find('.horse-name, .name, td:nth-child(1)').text().trim();
        const breed = $row.find('.breed, td:nth-child(2)').text().trim();
        const country = $row.find('.country, td:nth-child(3)').text().trim();
        const dob = $row.find('.dob, .birth-date, td:nth-child(4)').text().trim();
        const sex = $row.find('.sex, .gender, td:nth-child(5)').text().trim();
        const color = $row.find('.color, td:nth-child(6)').text().trim();
        const height = $row.find('.height, td:nth-child(7)').text().trim();
        
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
            horse_id: `SGL_${name.replace(/\s+/g, '_')}`,
            name,
            breed: breed || 'Unknown',
            country: country || 'USA',
            dob: parsedDob,
            sex: sex || '',
            height_cm: heightCm,
            color: color || '',
            sire_name: '', // Not available in search results
            dam_name: '', // Not available in search results
            source: 'SGL'
          };
          
          horses.push(horse);
        }
      });
      
      console.log(`Found ${horses.length} ShowGroundsLive horses matching: ${horseName}`);
      return horses;
      
    } catch (error) {
      console.error(`Error searching ShowGroundsLive horses by name ${horseName}:`, error);
      return [];
    }
  }

  // Scrape specific show results
  async scrapeShowResults(showId: string): Promise<Result[]> {
    try {
      console.log(`Scraping ShowGroundsLive results for show: ${showId}`);
      
      const url = `${this.baseUrl}/show/${showId}/results`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const results: Result[] = [];
      
      // Parse show-specific results
      $('table.class-results tbody tr, .class-result').each((index, element) => {
        const $row = $(element);
        
        const horseName = $row.find('.horse-name, .horse').text().trim();
        const riderName = $row.find('.rider-name, .rider').text().trim();
        const placing = $row.find('.placing, .place').text().trim();
        const faults = $row.find('.faults, .fault').text().trim();
        const time = $row.find('.time, .jump-off-time').text().trim();
        const earnings = $row.find('.earnings, .prize-money').text().trim();
        const className = $row.find('.class-name, .class').text().trim();
        const height = $row.find('.height, .jump-height').text().trim();
        
        // Parse data similar to scrapeCompetitionResults
        let parsedPlacing = 0;
        if (placing && !isNaN(parseInt(placing))) {
          parsedPlacing = parseInt(placing);
        }
        
        let parsedFaults = 0;
        if (faults && !isNaN(parseFloat(faults))) {
          parsedFaults = parseFloat(faults);
        }
        
        let timeSeconds = 0;
        if (time) {
          const timeMatch = time.match(/(\d+):(\d+\.?\d*)/);
          if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseFloat(timeMatch[2]);
            timeSeconds = minutes * 60 + seconds;
          }
        }
        
        let earningsUsd = 0;
        if (earnings) {
          const earningsMatch = earnings.replace(/[^0-9.-]/g, '');
          if (earningsMatch && !isNaN(parseFloat(earningsMatch))) {
            earningsUsd = parseFloat(earningsMatch);
          }
        }
        
        let heightCm = 0;
        if (height) {
          const heightMatch = height.match(/(\d+\.?\d*)\s*ft/i);
          if (heightMatch) {
            const feet = parseFloat(heightMatch[1]);
            heightCm = Math.round(feet * 30.48);
          }
        }
        
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
        
        if (horseName && className) {
          const result: Result = {
            result_id: `SGL_${showId}_${horseName.replace(/\s+/g, '_')}_${className}`,
            horse_id: `SGL_${horseName.replace(/\s+/g, '_')}`,
            class_id: `SGL_CLASS_${showId}_${className}`,
            placing: parsedPlacing,
            status: resultStatus,
            faults: parsedFaults,
            time_seconds: timeSeconds,
            earnings_usd: earningsUsd,
            source: 'SGL',
            result_raw_status: placing,
            class_height_cm: heightCm
          };
          
          results.push(result);
        }
      });
      
      console.log(`Found ${results.length} ShowGroundsLive results for show: ${showId}`);
      return results;
      
    } catch (error) {
      console.error(`Error scraping ShowGroundsLive results for show ${showId}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const showGroundsLiveScraper = new ShowGroundsLiveScraper();
