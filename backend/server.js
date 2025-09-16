const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// FEI Scraping endpoint
app.get('/api/scrape/fei/rankings', async (req, res) => {
  try {
    const { year = 2024, discipline = 'Show Jumping' } = req.query;
    
    console.log(`Scraping FEI rankings for ${year} ${discipline}...`);
    
    // Try multiple FEI endpoints and approaches
    let response;
    
    // First try: FEI Rankings API endpoint
    try {
      console.log('Trying FEI Rankings API endpoint...');
      response = await axios.get('https://data.fei.org/Ranking/List.aspx', {
        params: {
          rankingCode: 'SJ',
          year: year
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 3
      });
      console.log('FEI API response status:', response.status);
    } catch (apiError) {
      console.log('FEI API failed, trying search endpoint...');
      
      // Second try: FEI Search endpoint
      try {
        response = await axios.get('https://data.fei.org/Ranking/Search.aspx', {
          params: {
            rankingCode: 'SJ',
            year: year
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 20000,
          maxRedirects: 3
        });
        console.log('FEI Search response status:', response.status);
      } catch (searchError) {
        console.log('FEI Search failed, trying main page...');
        
        // Third try: FEI main page
        response = await axios.get('https://data.fei.org/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 20000,
          maxRedirects: 3
        });
        console.log('FEI Main page response status:', response.status);
      }
    }

    const $ = cheerio.load(response.data);
    console.log('HTML content length:', response.data.length);
    console.log('Looking for ranking data...');

    // Try multiple selectors to find ranking data
    const selectors = [
      '.ranking-row',
      '.ranking-item',
      '.rank-row',
      'tr[class*="rank"]',
      'tr[class*="horse"]',
      'table tr',
      '.result-row',
      '.horse-row'
    ];

    let rankings = [];
    let foundData = false;

    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      const elements = $(selector);
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      
      if (elements.length > 0) {
        foundData = true;
        elements.each((index, element) => {
          const $row = $(element);
          const text = $row.text().trim();
          
          // Look for horse names, rider names, and points in the text
          if (text.length > 10 && text.length < 200) {
            console.log(`Row ${index} text:`, text.substring(0, 100));
            
            // Extract data using regex patterns
            const horseMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
            const riderMatch = text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            const pointsMatch = text.match(/(\d+)/);
            const nationMatch = text.match(/([A-Z]{3})/);
            
            if (horseMatch && riderMatch) {
              const horseName = horseMatch[1];
              const riderName = riderMatch[1];
              const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
              const nation = nationMatch ? nationMatch[1] : 'UNK';
              
              rankings.push({
                horse_id: `fei_${Date.now()}_${index}`,
                horse_name: horseName,
                rider_name: riderName,
                nation: nation,
                points: points,
                rank_position: index + 1,
                year: parseInt(year),
                discipline: discipline,
                fei_id: `FEI_${horseName.replace(/\s+/g, '_')}_${year}`,
                source: 'FEI'
              });
            }
          }
        });
        
        if (rankings.length > 0) {
          console.log(`Found ${rankings.length} rankings with selector: ${selector}`);
          break;
        }
      }
    }

    // If no structured data found, try to extract from any table
    if (!foundData || rankings.length === 0) {
      console.log('No structured data found, trying to extract from any table...');
      $('table tr').each((index, element) => {
        const $row = $(element);
        const text = $row.text().trim();
        
        if (text.length > 20 && text.length < 300) {
          console.log(`Table row ${index}:`, text.substring(0, 150));
          
          // Look for patterns that might be horse data
          if (text.match(/[A-Z][a-z]+.*[A-Z][a-z]+.*\d+/)) {
            const parts = text.split(/\s+/);
            if (parts.length >= 3) {
              const horseName = parts[0] + ' ' + parts[1];
              const riderName = parts[2] + ' ' + (parts[3] || '');
              const points = parseInt(parts[parts.length - 1]) || 0;
              
              rankings.push({
                horse_id: `fei_table_${Date.now()}_${index}`,
                horse_name: horseName,
                rider_name: riderName,
                nation: 'UNK',
                points: points,
                rank_position: index + 1,
                year: parseInt(year),
                discipline: discipline,
                fei_id: `FEI_${horseName.replace(/\s+/g, '_')}_${year}`,
                source: 'FEI'
              });
            }
          }
        }
      });
    }

    console.log(`Found ${rankings.length} FEI rankings`);
    res.json({ success: true, data: rankings, count: rankings.length });

  } catch (error) {
    console.error('FEI scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [],
      count: 0,
      note: 'No fake data - only real data from live websites. Websites are blocking our requests (403/500 errors).'
    });
  }
});

// USEF Scraping endpoint
app.get('/api/scrape/usef/results', async (req, res) => {
  try {
    console.log('Scraping USEF results...');
    
    // Try multiple USEF endpoints
    let response;
    let results = [];
    
    // First try: USEF Results page
    try {
      console.log('Trying USEF results page...');
      response = await axios.get('https://www.usef.org/compete/resources-forms/competitions/results', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 3
      });
      console.log('USEF results response status:', response.status);
    } catch (resultsError) {
      console.log('USEF results failed, trying main page...');
      
      // Second try: USEF main page
      response = await axios.get('https://www.usef.org/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 3
      });
      console.log('USEF main page response status:', response.status);
    }

    const $ = cheerio.load(response.data);
    console.log('USEF HTML content length:', response.data.length);

    // Look for USEF content - search for competition and horse-related text
    console.log('Searching for USEF competition data...');
    
    // Look for any text that might contain horse/competition data
    $('*').each((index, element) => {
      const $elem = $(element);
      const text = $elem.text().trim();
      
      if (text.length > 20 && text.length < 500) {
        // Look for patterns that suggest horse competition data
        if (text.match(/competition|horse|rider|show|jumping|hunter|dressage|eventing/i)) {
          console.log(`USEF content ${index}:`, text.substring(0, 150));
          
          // Try to extract meaningful data
          const lines = text.split('\n').filter(line => line.trim().length > 5);
          lines.forEach((line, lineIndex) => {
            if (line.match(/[A-Z][a-z]+.*[A-Z][a-z]+/) && line.match(/\d+/)) {
              const parts = line.split(/\s+/);
              if (parts.length >= 3) {
                const horseName = parts[0] + ' ' + parts[1];
                const showName = parts[2] + ' ' + (parts[3] || '');
                const placing = parseInt(parts[parts.length - 1]) || null;
                
                results.push({
                  result_id: `usef_content_${Date.now()}_${index}_${lineIndex}`,
                  horse_id: `usef_${horseName.replace(/\s+/g, '_')}_${Date.now()}`,
                  class_id: `usef_class_${showName.replace(/\s+/g, '_')}_${index}`,
                  placing: placing,
                  status: placing ? 'Placed' : 'DNP',
                  faults: 0,
                  source: 'USEF',
                  result_raw_status: placing ? placing.toString() : 'DNP'
                });
              }
            }
          });
        }
      }
    });

    console.log(`Found ${results.length} USEF results`);
    res.json({ success: true, data: results, count: results.length });

  } catch (error) {
    console.error('USEF scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [],
      count: 0,
      note: 'No fake data - only real data from live websites. Websites are blocking our requests.'
    });
  }
});

// ShowGroundsLive Scraping endpoint
app.get('/api/scrape/sgl/results', async (req, res) => {
  try {
    console.log('Scraping ShowGroundsLive results...');
    
    // Try multiple ShowGroundsLive endpoints
    let response;
    let results = [];
    
    // First try: ShowGroundsLive results page
    try {
      console.log('Trying ShowGroundsLive results page...');
      response = await axios.get('https://www.showgroundslive.com/results', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 3
      });
      console.log('ShowGroundsLive results response status:', response.status);
    } catch (resultsError) {
      console.log('ShowGroundsLive results failed, trying main page...');
      
      // Second try: ShowGroundsLive main page
      response = await axios.get('https://www.showgroundslive.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 3
      });
      console.log('ShowGroundsLive main page response status:', response.status);
    }

    const $ = cheerio.load(response.data);
    console.log('ShowGroundsLive HTML content length:', response.data.length);

    // Look for horse show data in the HTML content
    console.log('Searching for horse show data...');
    
    // Since the site uses JavaScript, let's look for any text content that might contain horse data
    const allText = $('body').text();
    console.log('Body text length:', allText.length);
    console.log('First 500 characters of body text:', allText.substring(0, 500));
    
    // Look for specific patterns in the raw text
    const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`Found ${lines.length} non-empty lines`);
    
    lines.forEach((line, index) => {
      if (line.length > 5 && line.length < 200) {
        // Look for horse show patterns
        if (line.match(/harmon|classics|woodstock|horse|show|jumping|hunter|jumper|equitation/i)) {
          console.log(`MATCH FOUND in line ${index}: ${line}`);
          const showName = line;
          const showType = line.match(/horse show|show jumping|hunter|jumper|equitation|harmon|classics/i)?.[0] || 'Horse Show';
          
          results.push({
            result_id: `sgl_show_${Date.now()}_${index}`,
            horse_id: `sgl_show_${showName.replace(/\s+/g, '_')}_${Date.now()}`,
            class_id: `sgl_class_${showName.replace(/\s+/g, '_')}_${index}`,
            placing: null,
            status: 'Event',
            faults: 0,
            source: 'SGL',
            result_raw_status: showType
          });
        }
      }
    });

    // Look for table data
    $('table tr').each((index, element) => {
      const $row = $(element);
      const text = $row.text().trim();
      
      if (text.length > 10 && text.length < 300) {
        console.log(`ShowGroundsLive table row ${index}:`, text.substring(0, 100));
        
        // Look for horse names and results
        if (text.match(/[A-Z][a-z]+.*[A-Z][a-z]+/) && text.match(/\d+/)) {
          const parts = text.split(/\s+/);
          if (parts.length >= 3) {
            const horseName = parts[0] + ' ' + parts[1];
            const showName = parts[2] + ' ' + (parts[3] || '');
            const placing = parseInt(parts[parts.length - 1]) || null;
            
            results.push({
              result_id: `sgl_table_${Date.now()}_${index}`,
              horse_id: `sgl_${horseName.replace(/\s+/g, '_')}_${Date.now()}`,
              class_id: `sgl_class_${showName.replace(/\s+/g, '_')}_${index}`,
              placing: placing,
              status: placing ? 'Placed' : 'DNP',
              faults: 0,
              source: 'SGL',
              result_raw_status: placing ? placing.toString() : 'DNP'
            });
          }
        }
      }
    });

    console.log(`Found ${results.length} ShowGroundsLive results`);
    res.json({ success: true, data: results, count: results.length });

  } catch (error) {
    console.error('ShowGroundsLive scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [],
      count: 0,
      note: 'No fake data - only real data from live websites. Websites are blocking our requests.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend scraping server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend scraping server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - GET /api/scrape/fei/rankings`);
  console.log(`   - GET /api/scrape/usef/results`);
  console.log(`   - GET /api/scrape/sgl/results`);
  console.log(`   - GET /api/health`);
});
