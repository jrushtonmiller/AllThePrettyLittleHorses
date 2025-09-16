// Real Data Scraping Demo Component
// Demonstrates the scraping functionality for FEI, USEF, and ShowJumpingLive

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
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { realDataScrapingService } from '../services/realDataScraping';

interface DataSourceSummary {
  fei: { horses: number; lastUpdated: string };
  usef: { results: number; shows: number; lastUpdated: string };
  sjl: { results: number; shows: number; lastUpdated: string };
}

export function RealDataDemo() {
  const [dataSummary, setDataSummary] = useState<DataSourceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadDataSummary();
  }, []);

  const loadDataSummary = async () => {
    setLoading(true);
    try {
      const summary = await realDataScrapingService.getDataSourcesSummary();
      setDataSummary(summary);
    } catch (error) {
      console.error('Error loading data summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchHorse = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await realDataScrapingService.collectRealHorseData(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching horse:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const scrapeAllData = async () => {
    setLoading(true);
    try {
      // Scrape all data sources
      const [feiHorses, usefResults, usefShows, sjlResults, sjlShows] = await Promise.all([
        realDataScrapingService.scrapeFEIRankings(),
        realDataScrapingService.scrapeUSEFResults(),
        realDataScrapingService.scrapeUSEFShows(),
        realDataScrapingService.scrapeShowJumpingLiveResults(),
        realDataScrapingService.scrapeShowJumpingLiveShows()
      ]);

      console.log('Scraping completed:', {
        feiHorses: feiHorses.length,
        usefResults: usefResults.length,
        usefShows: usefShows.length,
        sjlResults: sjlResults.length,
        sjlShows: sjlShows.length
      });

      // Reload summary
      await loadDataSummary();
    } catch (error) {
      console.error('Error scraping all data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Real Data Scraping Demo</h1>
          <p className="text-stone-600 mt-1">Live scraping from FEI, USEF, and ShowJumpingLive</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDataSummary} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={scrapeAllData} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Scrape All Data
          </Button>
        </div>
      </div>

      {/* Data Sources Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FEI Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>FEI Database</span>
            </CardTitle>
            <CardDescription>Fédération Equestre Internationale</CardDescription>
          </CardHeader>
          <CardContent>
            {dataSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Horses:</span>
                  <span className="font-bold text-blue-600">{dataSummary.fei.horses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Last Updated:</span>
                  <span className="text-sm text-stone-500">
                    {new Date(dataSummary.fei.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-stone-600">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* USEF Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-red-600" />
              <span>USEF Results</span>
            </CardTitle>
            <CardDescription>United States Equestrian Federation</CardDescription>
          </CardHeader>
          <CardContent>
            {dataSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Results:</span>
                  <span className="font-bold text-red-600">{dataSummary.usef.results}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Shows:</span>
                  <span className="font-bold text-red-600">{dataSummary.usef.shows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Last Updated:</span>
                  <span className="text-sm text-stone-500">
                    {new Date(dataSummary.usef.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-stone-600">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ShowJumpingLive Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>ShowJumpingLive</span>
            </CardTitle>
            <CardDescription>Live Competition Results</CardDescription>
          </CardHeader>
          <CardContent>
            {dataSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Results:</span>
                  <span className="font-bold text-green-600">{dataSummary.sjl.results}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Shows:</span>
                  <span className="font-bold text-green-600">{dataSummary.sjl.shows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Last Updated:</span>
                  <span className="text-sm text-stone-500">
                    {new Date(dataSummary.sjl.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-stone-600">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Horse Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Real Horse Data</CardTitle>
          <CardDescription>Search for a horse across all data sources</CardDescription>
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
                  <Database className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              
              {/* Horse Information */}
              {searchResults.horse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Horse Found: {searchResults.horse.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-stone-600">Breed:</span>
                        <div className="font-medium">{searchResults.horse.breed}</div>
                      </div>
                      <div>
                        <span className="text-stone-600">Country:</span>
                        <div className="font-medium">{searchResults.horse.country}</div>
                      </div>
                      <div>
                        <span className="text-stone-600">Height:</span>
                        <div className="font-medium">{searchResults.horse.height_cm}cm</div>
                      </div>
                      <div>
                        <span className="text-stone-600">FEI ID:</span>
                        <div className="font-medium">{searchResults.horse.fei_id}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competition Results */}
              {searchResults.results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span>Competition Results ({searchResults.results.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.results.slice(0, 5).map((result: any, index: number) => (
                        <div key={result.result_id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant={result.status === 'Placed' ? 'default' : 'secondary'}>
                              {result.status === 'Placed' && result.placing ? `${result.placing}` : result.status}
                            </Badge>
                            <span className="text-sm font-medium">Class {index + 1}</span>
                            <Badge variant="outline">{result.source}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-stone-600">
                            {result.faults !== undefined && (
                              <span>{result.faults} faults</span>
                            )}
                            {result.earnings_usd && result.earnings_usd > 0 && (
                              <span className="text-green-600 font-medium">${result.earnings_usd}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Events */}
              {searchResults.events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Events ({searchResults.events.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchResults.events.slice(0, 5).map((event: any) => (
                        <div key={event.event_id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                          <div>
                            <div className="font-medium">{event.name}</div>
                            <div className="text-sm text-stone-600 flex items-center space-x-2">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{event.start_date}</div>
                            <Badge variant="outline">{event.federation}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!searchResults.horse && searchResults.results.length === 0 && searchResults.events.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-900 mb-2">No Data Found</h3>
                    <p className="text-stone-600">
                      No horse data found for "{searchTerm}". Try a different name or check the spelling.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sources Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Information about the data sources being scraped</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">FEI Database</h4>
                <p className="text-sm text-stone-600">
                  Official FEI rankings and horse information from data.fei.org
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  URL: https://data.fei.org/Ranking/Search.aspx
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Trophy className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h4 className="font-medium">USEF Results</h4>
                <p className="text-sm text-stone-600">
                  US Equestrian Federation competition results and shows
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  URL: https://www.usef.org/compete/resources-forms/competitions/results
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium">ShowJumpingLive</h4>
                <p className="text-sm text-stone-600">
                  Live competition results and event information
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  URL: https://www.showjumpinglive.com/results
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
