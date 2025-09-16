// Comprehensive Data Scraping Demo Component
// Demonstrates scraping from all major equestrian data sources worldwide

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
  Shield,
  Users,
  BookOpen,
  Star,
  Building,
  Search,
  Filter,
  BarChart3,
  Network
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { comprehensiveDataScrapingService } from '../services/comprehensiveDataScraping';

interface DataSourceSummary {
  [key: string]: {
    type: string;
    country: string;
    disciplines: string[];
    dataTypes: string[];
    requiresAuth: boolean;
    rateLimit: number;
    lastChecked: string;
  };
}

interface ScrapingResults {
  horses: any[];
  results: any[];
  events: any[];
  summary: any;
}

export function ComprehensiveDataDemo() {
  const [dataSources, setDataSources] = useState<DataSourceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResults | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setLoading(true);
    try {
      const summary = await comprehensiveDataScrapingService.getDataSourcesSummary();
      setDataSources(summary);
    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrapeAllData = async () => {
    setLoading(true);
    try {
      const results = await comprehensiveDataScrapingService.scrapeAllDataSources();
      setScrapingResults(results);
    } catch (error) {
      console.error('Error scraping all data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchHorse = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await comprehensiveDataScrapingService.searchHorseAcrossAllSources(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching horse:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'federation': return <Shield className="w-4 h-4" />;
      case 'show_management': return <Calendar className="w-4 h-4" />;
      case 'pedigree': return <BookOpen className="w-4 h-4" />;
      case 'series': return <Star className="w-4 h-4" />;
      case 'studbook': return <Building className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'federation': return 'bg-blue-100 text-blue-800';
      case 'show_management': return 'bg-green-100 text-green-800';
      case 'pedigree': return 'bg-purple-100 text-purple-800';
      case 'series': return 'bg-yellow-100 text-yellow-800';
      case 'studbook': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDataSources = dataSources ? Object.entries(dataSources).filter(([name, source]) => {
    if (selectedSourceType !== 'all' && source.type !== selectedSourceType) return false;
    if (selectedCountry !== 'all' && source.country !== selectedCountry) return false;
    return true;
  }) : [];

  const getUniqueCountries = () => {
    if (!dataSources) return [];
    const countries = new Set(Object.values(dataSources).map(s => s.country));
    return Array.from(countries).sort();
  };

  const getSourceTypeCounts = () => {
    if (!dataSources) return {};
    const counts: { [key: string]: number } = {};
    Object.values(dataSources).forEach(source => {
      counts[source.type] = (counts[source.type] || 0) + 1;
    });
    return counts;
  };

  const typeCounts = getSourceTypeCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Comprehensive Data Scraping</h1>
          <p className="text-stone-600 mt-1">Global equestrian data from {dataSources ? Object.keys(dataSources).length : 0} sources</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDataSources} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={scrapeAllData} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Scrape All Data
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{typeCounts.federation || 0}</div>
                <div className="text-sm text-stone-600">Federations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{typeCounts.show_management || 0}</div>
                <div className="text-sm text-stone-600">Show Systems</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{typeCounts.pedigree || 0}</div>
                <div className="text-sm text-stone-600">Pedigree DBs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{typeCounts.series || 0}</div>
                <div className="text-sm text-stone-600">Series</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{typeCounts.studbook || 0}</div>
                <div className="text-sm text-stone-600">Studbooks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Data Sources</CardTitle>
          <CardDescription>Find and filter data sources by type and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search horse name across all sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="federation">Federations</SelectItem>
                <SelectItem value="show_management">Show Management</SelectItem>
                <SelectItem value="pedigree">Pedigree Databases</SelectItem>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="studbook">Studbooks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {getUniqueCountries().map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="results">Scraping Results</TabsTrigger>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDataSources.map(([name, source]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSourceTypeIcon(source.type)}
                      <span className="text-lg">{name}</span>
                    </div>
                    <Badge className={getSourceTypeColor(source.type)}>
                      {source.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3" />
                      <span>{source.country}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-stone-600">Disciplines:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.disciplines.map(discipline => (
                          <Badge key={discipline} variant="outline" className="text-xs">
                            {discipline}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-stone-600">Data Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.dataTypes.map(dataType => (
                          <Badge key={dataType} variant="secondary" className="text-xs">
                            {dataType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Rate Limit:</span>
                      <span className="font-medium">{source.rateLimit}/min</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Auth Required:</span>
                      <span className={source.requiresAuth ? 'text-red-600' : 'text-green-600'}>
                        {source.requiresAuth ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-stone-500">
                      Last checked: {new Date(source.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scraping Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {scrapingResults ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{scrapingResults.horses.length}</div>
                        <div className="text-sm text-stone-600">Horses</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{scrapingResults.results.length}</div>
                        <div className="text-sm text-stone-600">Results</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-600">{scrapingResults.events.length}</div>
                        <div className="text-sm text-stone-600">Events</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Network className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{Object.keys(scrapingResults.summary).length}</div>
                        <div className="text-sm text-stone-600">Sources</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Source-by-Source Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Source Results</CardTitle>
                  <CardDescription>Results from each data source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(scrapingResults.summary).map(([sourceName, summary]: [string, any]) => (
                      <div key={sourceName} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium">{sourceName}</div>
                          {summary.error ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <Badge variant="default">Success</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-stone-600">
                          {summary.horses && <span>{summary.horses} horses</span>}
                          {summary.results && <span>{summary.results} results</span>}
                          {summary.events && <span>{summary.events} events</span>}
                          <span className="text-xs">
                            {new Date(summary.lastUpdated).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No Scraping Results</h3>
                <p className="text-stone-600 mb-4">
                  Click "Scrape All Data" to collect data from all sources.
                </p>
                <Button onClick={scrapeAllData} disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Start Scraping
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Search Results Tab */}
        <TabsContent value="search" className="space-y-4">
          {searchResults ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Results for "{searchTerm}"</CardTitle>
                  <CardDescription>Results from all data sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{searchResults.horses.length}</div>
                      <div className="text-sm text-stone-600">Horses Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{searchResults.results.length}</div>
                      <div className="text-sm text-stone-600">Results Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{searchResults.events.length}</div>
                      <div className="text-sm text-stone-600">Events Found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Display search results */}
              {searchResults.horses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Horses</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                            <div className="text-xs text-stone-500 mt-1">
                              Confidence: {Math.round(horse.identity_confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No Search Results</h3>
                <p className="text-stone-600">
                  Enter a horse name and click search to find results across all data sources.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Source Distribution</CardTitle>
                <CardDescription>Sources by type and country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSourceTypeIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / (dataSources ? Object.keys(dataSources).length : 1)) * 100} className="w-20" />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Sources by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getUniqueCountries().map(country => {
                    const count = dataSources ? Object.values(dataSources).filter(s => s.country === country).length : 0;
                    return (
                      <div key={country} className="flex items-center justify-between">
                        <span>{country}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(count / (dataSources ? Object.keys(dataSources).length : 1)) * 100} className="w-20" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
