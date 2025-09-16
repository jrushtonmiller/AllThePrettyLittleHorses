// Admin Dashboard Component
// Manages data sources, model training, and system monitoring

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  BarChart3, 
  Download, 
  Upload,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { dataService } from '../services/dataService';
import { predictionModelEngine } from '../services/predictionModel';
import { scrapingEngine } from '../services/scraping';

interface SystemStats {
  totalHorses: number;
  totalResults: number;
  totalPredictions: number;
  averagePredictionScore: number;
  topPerformingCountries: { country: string; count: number }[];
  topPerformingBreeds: { breed: string; count: number }[];
}

interface ScrapingJob {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  recordsProcessed: number;
  startTime: string;
  endTime?: string;
}

export function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, model] = await Promise.all([
        dataService.getStatistics(),
        predictionModelEngine.getModelStatus()
      ]);

      setSystemStats(stats);
      setModelStatus(model);

      // Mock scraping jobs
      setScrapingJobs([
        {
          id: '1',
          source: 'FEI',
          status: 'completed',
          progress: 100,
          recordsProcessed: 6156,
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:30:00Z'
        },
        {
          id: '2',
          source: 'USEF',
          status: 'running',
          progress: 65,
          recordsProcessed: 2340,
          startTime: '2024-01-15T12:00:00Z'
        },
        {
          id: '3',
          source: 'SGL',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          startTime: '2024-01-15T14:00:00Z'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScrapingJob = async (source: string) => {
    try {
      let job;
      switch (source) {
        case 'fei':
          job = await scrapingEngine.scrapeFEIRankings(2024, 'Show Jumping');
          break;
        case 'usef':
          job = await scrapingEngine.scrapeUSEFResults();
          break;
        case 'sgl':
          job = await scrapingEngine.scrapeSGLResults();
          break;
      }
      
      if (job) {
        setScrapingJobs(prev => [...prev, {
          id: job.job_id,
          source: job.source.toUpperCase(),
          status: job.status as any,
          progress: job.status === 'completed' ? 100 : 0,
          recordsProcessed: job.records_processed || 0,
          startTime: job.created_at,
          endTime: job.completed_at
        }]);
      }
    } catch (error) {
      console.error('Error starting scraping job:', error);
    }
  };

  const trainModel = async () => {
    try {
      // Mock model training
      console.log('Starting model training...');
      // In production, this would trigger actual model training
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Model training completed');
    } catch (error) {
      console.error('Error training model:', error);
    }
  };

  const exportData = async (format: 'csv' | 'excel' | 'json') => {
    try {
      console.log(`Exporting data in ${format} format...`);
      // In production, this would generate and download the export file
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading admin dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-600 mt-1">System monitoring and management</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadDashboardData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">
                  {systemStats?.totalHorses || 0}
                </div>
                <div className="text-sm text-stone-600">Total Horses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">
                  {systemStats?.totalResults || 0}
                </div>
                <div className="text-sm text-stone-600">Total Results</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">
                  {systemStats?.totalPredictions || 0}
                </div>
                <div className="text-sm text-stone-600">Predictions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">
                  {systemStats?.averagePredictionScore ? (systemStats.averagePredictionScore * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-stone-600">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
          <TabsTrigger value="scraping">Data Scraping</TabsTrigger>
          <TabsTrigger value="model">Model Management</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Top Performing Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStats?.topPerformingCountries.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={(country.count / (systemStats.topPerformingCountries[0]?.count || 1)) * 100} className="w-20 h-2" />
                      <span className="text-sm text-stone-600 w-12 text-right">{country.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Breeds */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Breeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStats?.topPerformingBreeds.slice(0, 5).map((breed, index) => (
                  <div key={breed.breed} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{breed.breed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={(breed.count / (systemStats.topPerformingBreeds[0]?.count || 1)) * 100} className="w-20 h-2" />
                      <span className="text-sm text-stone-600 w-12 text-right">{breed.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Manage data collection from various sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">FEI Database</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">Official FEI rankings and results</p>
                  <Button size="sm" onClick={() => startScrapingJob('fei')}>
                    <Play className="w-3 h-3 mr-1" />
                    Start Scraping
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">USEF Results</h4>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">US Equestrian Federation results</p>
                  <Button size="sm" onClick={() => startScrapingJob('usef')}>
                    <Play className="w-3 h-3 mr-1" />
                    Start Scraping
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">ShowGroundsLive</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">Hunter/Jumper competition results</p>
                  <Button size="sm" onClick={() => startScrapingJob('sgl')}>
                    <Play className="w-3 h-3 mr-1" />
                    Start Scraping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scraping Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Active Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scrapingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <div className="font-medium">{job.source} Scraping</div>
                        <div className="text-sm text-stone-600">
                          Started: {new Date(job.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{job.recordsProcessed} records</div>
                        <div className="text-xs text-stone-600">{job.progress}% complete</div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          {/* Model Status */}
          <Card>
            <CardHeader>
              <CardTitle>Model Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-stone-50 rounded-lg">
                  <div className="text-2xl font-bold text-stone-800">
                    {modelStatus?.isTrained ? 'Trained' : 'Not Trained'}
                  </div>
                  <div className="text-sm text-stone-600">Status</div>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-lg">
                  <div className="text-2xl font-bold text-stone-800">
                    v{modelStatus?.version || 'N/A'}
                  </div>
                  <div className="text-sm text-stone-600">Version</div>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-lg">
                  <div className="text-2xl font-bold text-stone-800">
                    {modelStatus?.lastTrained || 'Never'}
                  </div>
                  <div className="text-sm text-stone-600">Last Trained</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={trainModel} className="bg-emerald-600 hover:bg-emerald-700">
                  <Target className="w-4 h-4 mr-2" />
                  Train New Model
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Model Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-lg font-bold text-stone-800">0.75</div>
                  <div className="text-xs text-stone-600">AUC-PR</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-lg font-bold text-stone-800">0.15</div>
                  <div className="text-xs text-stone-600">Brier Score</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-lg font-bold text-stone-800">2.5x</div>
                  <div className="text-xs text-stone-600">Lift @ K</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-lg font-bold text-stone-800">65%</div>
                  <div className="text-xs text-stone-600">Top-K Precision</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export system data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => exportData('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => exportData('excel')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportData('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Import */}
          <Card>
            <CardHeader>
              <CardTitle>Data Import</CardTitle>
              <CardDescription>Import data from external sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import FEI Data
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Pedigree Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
