// Real FEI Data Scraping Implementation
// Scrapes actual data from FEI website

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Horse, Result, Event, FEIRanking } from '../../types/database';

export class FEIScraper {
  private readonly baseUrl = 'https://data.fei.org';
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

  // Scrape FEI World Rankings
  async scrapeWorldRankings(year: number = 2024, discipline: string = 'Show Jumping'): Promise<FEIRanking[]> {
    try {
      console.log(`Scraping FEI World Rankings for ${year} ${discipline}...`);
      
      // FEI World Rankings URL
      const url = `${this.baseUrl}/Ranking/Search.aspx?rankingCode=WS${year}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const rankings: FEIRanking[] = [];
      
      // Parse the rankings table
      $('table#ctl00_ContentPlaceHolder1_gvRanking tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 6) {
          const rank = parseInt($(cells[0]).text().trim());
          const horseName = $(cells[1]).text().trim();
          const riderName = $(cells[2]).text().trim();
          const nation = $(cells[3]).text().trim();
          const points = parseInt($(cells[4]).text().replace(/,/g, '').trim());
          
          // Extract FEI ID from horse name link
          const horseLink = $(cells[1]).find('a').attr('href');
          const feiId = horseLink ? horseLink.match(/horseId=(\d+)/)?.[1] : null;
          
          if (horseName && !isNaN(rank) && !isNaN(points)) {
            rankings.push({
              horse_id: feiId || `FEI_${horseName.replace(/\s+/g, '_')}_${year}`,
              year,
              discipline,
              rank_position: rank,
              present_flag: true,
              horse_name: horseName,
              rider_name: riderName,
              nation,
              points,
              fei_id: feiId
            });
          }
        }
      });
      
      console.log(`Found ${rankings.length} FEI rankings for ${year} ${discipline}`);
      return rankings;
      
    } catch (error) {
      console.error('Error scraping FEI World Rankings:', error);
      return [];
    }
  }

  // Scrape individual horse details
  async scrapeHorseDetails(feiId: string): Promise<Horse | null> {
    try {
      console.log(`Scraping FEI horse details for ID: ${feiId}`);
      
      const url = `${this.baseUrl}/Horse/Detail.aspx?pagename=HorseDetail&horseId=${feiId}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      // Extract horse information
      const name = $('h1').text().trim() || $('.horse-name').text().trim();
      const breed = $('td:contains("Breed")').next('td').text().trim();
      const country = $('td:contains("Country")').next('td').text().trim();
      const dob = $('td:contains("Date of Birth")').next('td').text().trim();
      const sex = $('td:contains("Sex")').next('td').text().trim();
      const color = $('td:contains("Colour")').next('td').text().trim();
      const height = $('td:contains("Height")').next('td').text().trim();
      
      // Extract sire and dam information
      const sireName = $('td:contains("Sire")').next('td').text().trim();
      const damName = $('td:contains("Dam")').next('td').text().trim();
      
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
          horse_id: feiId,
          name,
          breed: breed || 'Unknown',
          country: country || '',
          dob: parsedDob,
          sex: sex || '',
          height_cm: heightCm,
          color: color || '',
          sire_name: sireName || '',
          dam_name: damName || '',
          fei_id: feiId,
          source: 'FEI'
        };
        
        console.log(`Successfully scraped horse details for: ${name}`);
        return horse;
      }
      
      return null;
      
    } catch (error) {
      console.error(`Error scraping FEI horse details for ID ${feiId}:`, error);
      return null;
    }
  }

  // Scrape horse competition results
  async scrapeHorseResults(feiId: string, year?: number): Promise<Result[]> {
    try {
      console.log(`Scraping FEI horse results for ID: ${feiId}`);
      
      const url = `${this.baseUrl}/Horse/Detail.aspx?pagename=HorseDetail&horseId=${feiId}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const results: Result[] = [];
      
      // Parse results table
      $('table#ctl00_ContentPlaceHolder1_gvResults tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 8) {
          const date = $(cells[0]).text().trim();
          const eventName = $(cells[1]).text().trim();
          const className = $(cells[2]).text().trim();
          const placing = $(cells[3]).text().trim();
          const faults = $(cells[4]).text().trim();
          const time = $(cells[5]).text().trim();
          const earnings = $(cells[6]).text().trim();
          const status = $(cells[7]).text().trim();
          
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
          if (status.toLowerCase().includes('retired') || status.toLowerCase().includes('ret')) {
            resultStatus = 'R';
          } else if (status.toLowerCase().includes('eliminated') || status.toLowerCase().includes('elim')) {
            resultStatus = 'E';
          } else if (status.toLowerCase().includes('withdrawn') || status.toLowerCase().includes('wd')) {
            resultStatus = 'WD';
          } else if (status.toLowerCase().includes('dnp') || status.toLowerCase().includes('did not place')) {
            resultStatus = 'DNP';
          }
          
          const result: Result = {
            result_id: `FEI_${feiId}_${eventName}_${className}_${parsedDate}`,
            horse_id: feiId,
            class_id: `FEI_CLASS_${eventName}_${className}`,
            placing: parsedPlacing,
            status: resultStatus,
            faults: parsedFaults,
            time_seconds: timeSeconds,
            earnings_usd: earningsUsd,
            source: 'FEI',
            result_raw_status: status,
            class_height_cm: 0 // Would need to extract from class name or separate API call
          };
          
          results.push(result);
        }
      });
      
      console.log(`Found ${results.length} FEI results for horse ID: ${feiId}`);
      return results;
      
    } catch (error) {
      console.error(`Error scraping FEI horse results for ID ${feiId}:`, error);
      return [];
    }
  }

  // Scrape FEI events
  async scrapeEvents(year: number = 2024): Promise<Event[]> {
    try {
      console.log(`Scraping FEI events for ${year}...`);
      
      const url = `${this.baseUrl}/Event/Calendar.aspx?year=${year}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const events: Event[] = [];
      
      // Parse events table
      $('table#ctl00_ContentPlaceHolder1_gvEvents tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 5) {
          const date = $(cells[0]).text().trim();
          const name = $(cells[1]).text().trim();
          const venue = $(cells[2]).text().trim();
          const location = $(cells[3]).text().trim();
          const discipline = $(cells[4]).text().trim();
          
          // Parse date
          let parsedDate = '';
          if (date) {
            const dateMatch = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (dateMatch) {
              const [, month, day, year] = dateMatch;
              parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }
          
          if (name && parsedDate) {
            const event: Event = {
              event_id: `FEI_EVENT_${name.replace(/\s+/g, '_')}_${parsedDate}`,
              name,
              venue: venue || '',
              location: location || '',
              start_date: parsedDate,
              federation: 'FEI'
            };
            
            events.push(event);
          }
        }
      });
      
      console.log(`Found ${events.length} FEI events for ${year}`);
      return events;
      
    } catch (error) {
      console.error('Error scraping FEI events:', error);
      return [];
    }
  }

  // Search for horses by name
  async searchHorsesByName(horseName: string): Promise<Horse[]> {
    try {
      console.log(`Searching FEI horses by name: ${horseName}`);
      
      const url = `${this.baseUrl}/Horse/Search.aspx?name=${encodeURIComponent(horseName)}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);
      
      const horses: Horse[] = [];
      
      // Parse search results
      $('table#ctl00_ContentPlaceHolder1_gvHorses tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 4) {
          const name = $(cells[0]).text().trim();
          const breed = $(cells[1]).text().trim();
          const country = $(cells[2]).text().trim();
          const dob = $(cells[3]).text().trim();
          
          // Extract FEI ID from link
          const horseLink = $(cells[0]).find('a').attr('href');
          const feiId = horseLink ? horseLink.match(/horseId=(\d+)/)?.[1] : null;
          
          if (name && feiId) {
            // Parse date of birth
            let parsedDob = '';
            if (dob) {
              const dateMatch = dob.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (dateMatch) {
                const [, month, day, year] = dateMatch;
                parsedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
            }
            
            const horse: Horse = {
              horse_id: feiId,
              name,
              breed: breed || 'Unknown',
              country: country || '',
              dob: parsedDob,
              sex: '', // Not available in search results
              height_cm: 0, // Not available in search results
              color: '', // Not available in search results
              sire_name: '', // Not available in search results
              dam_name: '', // Not available in search results
              fei_id: feiId,
              source: 'FEI'
            };
            
            horses.push(horse);
          }
        }
      });
      
      console.log(`Found ${horses.length} FEI horses matching: ${horseName}`);
      return horses;
      
    } catch (error) {
      console.error(`Error searching FEI horses by name ${horseName}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const feiScraper = new FEIScraper();
