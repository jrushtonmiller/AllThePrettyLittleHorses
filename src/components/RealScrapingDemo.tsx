// Real Scraping Demo Component
// Demonstrates actual web scraping from FEI, USEF, and ShowGroundsLive

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Globe, 
  Calendar,
  TrendingUp,
  MapPin,
  DollarSign,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Activity,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { realScrapingService } from '../services/realScraping';

interface ScrapingStatus {
  isActive: boolean;
  lastScrapingTime: string;
  cacheSize: number;
  availableSources: string[];
  errors: string[];
}

interface ScrapingResults {
  horses: any[];
  results: any[];
  events: any[];
  rankings: any[];
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

export function RealScrapingDemo() {
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus | null>(null);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeScraping, setActiveScraping] = useState(false);

  useEffect(() => {
    loadScrapingStatus();
  }, []);

  const loadScrapingStatus = async () => {
    try {
      const status = await realScrapingService.getScrapingStatus();
      setScrapingStatus(status);
    } catch (error) {
      console.error('Error loading scraping status:', error);
    }
  };

  const startRealScraping = async () => {
    setLoading(true);
    setActiveScraping(true);
    
    try {
      console.log('Starting real scraping from all sources...');
      
      // Start scraping with progress updates
      const results = await realScrapingService.scrapeAllSources({
        year: 2024,
        discipline: 'Show Jumping'
      });
      
      setScrapingResults(results);
      console.log('Real scraping completed:', results.summary);
      
    } catch (error) {
      console.error('Error during real scraping:', error);
    } finally {
      setLoading(false);
      setActiveScraping(false);
      await loadScrapingStatus();
    }
  };

  const searchHorse = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      console.log(`Searching for horse: ${searchTerm}...`);
      const horses = await realScrapingService.searchHorsesByName(searchTerm);
      setSearchResults({ horses });
      console.log(`Found ${horses.length} horses for: ${searchTerm}`);
    } catch (error) {
      console.error('Error searching horse:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearCache = () => {
    realScrapingService.clearCache();
    loadScrapingStatus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Real Web Scraping Demo</h1>
          <p className="text-stone-600 mt-1">Live scraping from FEI, USEF, and ShowGroundsLive websites</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadScrapingStatus} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button variant="outline" onClick={clearCache} disabled={loading}>
            <Database className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button 
            onClick={startRealScraping} 
            disabled={loading || activeScraping}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {activeScraping ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Scraping...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Real Scraping
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scraping Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Scraping Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrapingStatus ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${scrapingStatus.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{scrapingStatus.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="text-xs text-stone-500">
                  Last: {new Date(scrapingStatus.lastScrapingTime).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-stone-600 text-sm">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-600" />
              <span>Cache Size</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrapingStatus ? (
              <div className="text-2xl font-bold text-green-600">{scrapingStatus.cacheSize}</div>
            ) : (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-stone-600 text-sm">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrapingStatus ? (
              <div className="text-2xl font-bold text-purple-600">{scrapingStatus.availableSources.length}</div>
            ) : (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-stone-600 text-sm">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Errors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrapingStatus ? (
              <div className="text-2xl font-bold text-red-600">{scrapingStatus.errors.length}</div>
            ) : (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-stone-600 text-sm">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Sources */}
      {scrapingStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Available Scraping Sources</CardTitle>
            <CardDescription>Real-time scraping from these websites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scrapingStatus.availableSources.map(source => (
                <Badge key={source} variant="outline" className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>{source}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horse Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Real Horse Data</CardTitle>
          <CardDescription>Search for horses across all scraping sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Enter horse name (e.g., Bull Run's Jireh)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchHorse} disabled={searchLoading || !searchTerm.trim()}>
              {searchLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              
              {searchResults.horses.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.horses.map((horse: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div>
                        <div className="font-medium">{horse.name}</div>
                        <div className="text-sm text-stone-600">
                          {horse.breed} • {horse.country} • {horse.sex}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{horse.source}</Badge>
                        {horse.fei_id && (
                          <div className="text-xs text-stone-500 mt-1">
                            FEI ID: {horse.fei_id}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-900 mb-2">No Horses Found</h3>
                    <p className="text-stone-600">
                      No horses found for "{searchTerm}". Try a different name or check the spelling.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scraping Results */}
      {scrapingResults && (
        <Card>
          <CardHeader>
            <CardTitle>Real Scraping Results</CardTitle>
            <CardDescription>Data collected from live websites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{scrapingResults.summary.totalHorses}</div>
                  <div className="text-sm text-stone-600">Horses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{scrapingResults.summary.totalResults}</div>
                  <div className="text-sm text-stone-600">Results</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{scrapingResults.summary.totalEvents}</div>
                  <div className="text-sm text-stone-600">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{scrapingResults.summary.totalRankings}</div>
                  <div className="text-sm text-stone-600">Rankings</div>
                </div>
              </div>

              {/* Sources */}
              <div>
                <h4 className="font-medium mb-2">Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {scrapingResults.summary.sources.map(source => (
                    <Badge key={source} variant="default">{source}</Badge>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {scrapingResults.summary.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Scraping Errors</h4>
                  <div className="space-y-1">
                    {scrapingResults.summary.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-sm text-stone-500">
                Last updated: {new Date(scrapingResults.summary.lastUpdated).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scraping Progress */}
      {activeScraping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>Scraping in Progress</span>
            </CardTitle>
            <CardDescription>Collecting data from live websites...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={75} className="w-full" />
              <div className="text-sm text-stone-600">
                Scraping FEI rankings, USEF results, and ShowGroundsLive data...
              </div>
              <div className="flex items-center space-x-2 text-sm text-stone-500">
                <Clock className="w-4 h-4" />
                <span>This may take a few minutes due to rate limiting</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Real Scraping Works</CardTitle>
          <CardDescription>Understanding the scraping process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Rate Limited Requests</h4>
                <p className="text-sm text-stone-600">
                  Each website is scraped with proper delays to respect their servers and avoid being blocked.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">HTML Parsing</h4>
                <p className="text-sm text-stone-600">
                  Raw HTML is parsed to extract horse names, results, rankings, and event information.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Data Normalization</h4>
                <p className="text-sm text-stone-600">
                  Data is cleaned, standardized, and converted to consistent formats across all sources.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h4 className="font-medium">Caching & Fallbacks</h4>
                <p className="text-sm text-stone-600">
                  Results are cached for 30 minutes, with fallback to simulation if scraping fails.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
