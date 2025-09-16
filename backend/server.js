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
    
    // Make request to FEI website
    const response = await axios.get('https://data.fei.org/Ranking/Search.aspx', {
      params: {
        year: year,
        discipline: discipline
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const rankings = [];

    // Parse FEI rankings from HTML
    $('.ranking-row').each((index, element) => {
      const $row = $(element);
      const horseName = $row.find('.horse-name').text().trim();
      const riderName = $row.find('.rider-name').text().trim();
      const nation = $row.find('.nation').text().trim();
      const points = parseInt($row.find('.points').text().trim()) || 0;
      const rank = parseInt($row.find('.rank').text().trim()) || index + 1;

      if (horseName) {
        rankings.push({
          horse_id: `fei_${Date.now()}_${index}`,
          horse_name: horseName,
          rider_name: riderName,
          nation: nation,
          points: points,
          rank_position: rank,
          year: parseInt(year),
          discipline: discipline,
          fei_id: `FEI_${horseName.replace(/\s+/g, '_')}_${year}`,
          source: 'FEI'
        });
      }
    });

    console.log(`Found ${rankings.length} FEI rankings`);
    res.json({ success: true, data: rankings, count: rankings.length });

  } catch (error) {
    console.error('FEI scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: 'Using simulation data due to scraping error'
    });
  }
});

// USEF Scraping endpoint
app.get('/api/scrape/usef/results', async (req, res) => {
  try {
    console.log('Scraping USEF results...');
    
    const response = await axios.get('https://www.usef.org/compete/resources-forms/competitions/results', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse USEF results from HTML
    $('.result-row').each((index, element) => {
      const $row = $(element);
      const horseName = $row.find('.horse-name').text().trim();
      const showName = $row.find('.show-name').text().trim();
      const placing = parseInt($row.find('.placing').text().trim()) || null;
      const faults = parseInt($row.find('.faults').text().trim()) || 0;

      if (horseName && showName) {
        results.push({
          result_id: `usef_${Date.now()}_${index}`,
          horse_id: `usef_${horseName.replace(/\s+/g, '_')}_${Date.now()}`,
          class_id: `usef_class_${showName.replace(/\s+/g, '_')}_${index}`,
          placing: placing,
          status: placing ? 'Placed' : 'DNP',
          faults: faults,
          source: 'USEF',
          result_raw_status: placing ? placing.toString() : 'DNP'
        });
      }
    });

    console.log(`Found ${results.length} USEF results`);
    res.json({ success: true, data: results, count: results.length });

  } catch (error) {
    console.error('USEF scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: 'Using simulation data due to scraping error'
    });
  }
});

// ShowGroundsLive Scraping endpoint
app.get('/api/scrape/sgl/results', async (req, res) => {
  try {
    console.log('Scraping ShowGroundsLive results...');
    
    const response = await axios.get('https://www.showgroundslive.com/results', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse ShowGroundsLive results from HTML
    $('.result-row').each((index, element) => {
      const $row = $(element);
      const horseName = $row.find('.horse-name').text().trim();
      const showName = $row.find('.show-name').text().trim();
      const placing = parseInt($row.find('.placing').text().trim()) || null;
      const faults = parseInt($row.find('.faults').text().trim()) || 0;

      if (horseName && showName) {
        results.push({
          result_id: `sgl_${Date.now()}_${index}`,
          horse_id: `sgl_${horseName.replace(/\s+/g, '_')}_${Date.now()}`,
          class_id: `sgl_class_${showName.replace(/\s+/g, '_')}_${index}`,
          placing: placing,
          status: placing ? 'Placed' : 'DNP',
          faults: faults,
          source: 'SGL',
          result_raw_status: placing ? placing.toString() : 'DNP'
        });
      }
    });

    console.log(`Found ${results.length} ShowGroundsLive results`);
    res.json({ success: true, data: results, count: results.length });

  } catch (error) {
    console.error('ShowGroundsLive scraping error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: 'Using simulation data due to scraping error'
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
