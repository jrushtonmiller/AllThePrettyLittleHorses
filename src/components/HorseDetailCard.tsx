// Detailed Horse Card Component with Full Analysis
// Shows comprehensive horse information, pedigree, performance, and predictions

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  BarChart3, 
  Users, 
  MapPin, 
  Calendar,
  Trophy,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Horse, Result, Relative, Prediction, HorseFeatures } from '../types/database';
import { dataService } from '../services/dataService';
import { predictionModelEngine } from '../services/predictionModel';

interface HorseDetailCardProps {
  horseId: string;
  onClose?: () => void;
}

export function HorseDetailCard({ horseId, onClose }: HorseDetailCardProps) {
  const [horse, setHorse] = useState<Horse | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [features, setFeatures] = useState<HorseFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadHorseData();
  }, [horseId]);

  const loadHorseData = async () => {
    setLoading(true);
    try {
      const [horseData, resultsData, relativesData] = await Promise.all([
        dataService.getHorseById(horseId),
        dataService.getResults(horseId),
        dataService.getRelatives(horseId)
      ]);

      setHorse(horseData);
      setResults(resultsData);
      setRelatives(relativesData);

      if (horseData) {
        // Load prediction and features
        const [predictionData, featuresData] = await Promise.all([
          dataService.getPredictions([horseId]).then(preds => preds[0] || null),
          dataService.getHorseFeatures(horseId, new Date().toISOString().split('T')[0])
        ]);

        setPrediction(predictionData);
        setFeatures(featuresData);
      }
    } catch (error) {
      console.error('Error loading horse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPerformanceStats = () => {
    if (!results.length) return null;

    const totalCompetitions = results.length;
    const placedResults = results.filter(r => r.status === 'Placed');
    const top3Results = placedResults.filter(r => r.placing && r.placing <= 3);
    const retiredResults = results.filter(r => r.status === 'R');
    const eliminatedResults = results.filter(r => r.status === 'E');
    const dnpResults = results.filter(r => r.status === 'DNP');

    const totalEarnings = results.reduce((sum, r) => sum + (r.earnings_usd || 0), 0);

    return {
      totalCompetitions,
      totalEarnings,
      top3Rate: (top3Results.length / totalCompetitions) * 100,
      retirementRate: (retiredResults.length / totalCompetitions) * 100,
      eliminationRate: (eliminatedResults.length / totalCompetitions) * 100,
      dnpRate: (dnpResults.length / totalCompetitions) * 100
    };
  };

  const getPedigreeInfo = () => {
    if (!relatives.length) return null;

    const dams = relatives.filter(r => r.relationship === 'dam');
    const sires = relatives.filter(r => r.relationship === 'sire');
    const fullSiblings = relatives.filter(r => r.relationship === 'full_sibling');
    const halfSiblings = relatives.filter(r => r.relationship === 'half_sibling');

    return {
      damCount: dams.length,
      sireCount: sires.length,
      fullSiblingCount: fullSiblings.length,
      halfSiblingCount: halfSiblings.length
    };
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading horse details...</p>
        </CardContent>
      </Card>
    );
  }

  if (!horse) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-stone-600">Horse not found</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const performanceStats = getPerformanceStats();
  const pedigreeInfo = getPedigreeInfo();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{horse.name}</CardTitle>
                <Badge variant="outline">{horse.sex}</Badge>
                <Badge variant="secondary">{horse.country}</Badge>
                {prediction && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <Target className="w-3 h-3 mr-1" />
                    {(prediction.p_champion * 100).toFixed(1)}% Champion
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {horse.breed} • {horse.height_hands}h ({horse.height_cm}cm) • Born {new Date(horse.dob).toLocaleDateString()}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Prediction Overview */}
      {prediction && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <Trophy className="w-5 h-5" />
              <span>Champion Prediction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {(prediction.p_champion * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-emerald-700">Champion Probability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  #{prediction.rank || 'N/A'}
                </div>
                <div className="text-sm text-emerald-700">Predicted Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  v{prediction.model_version}
                </div>
                <div className="text-sm text-emerald-700">Model Version</div>
              </div>
            </div>
            
            {prediction.explanation && prediction.explanation.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-emerald-800 mb-2">Key Factors:</h4>
                <div className="space-y-1">
                  {prediction.explanation.map((explanation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-emerald-700">{explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pedigree">Pedigree</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Registration:</span>
                  <span className="font-medium">{horse.registration_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">FEI ID:</span>
                  <span className="font-medium">{horse.fei_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Owner:</span>
                  <span className="font-medium">{horse.owner || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Trainer:</span>
                  <span className="font-medium">{horse.trainer || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Total Competitions:</span>
                      <span className="font-medium">{performanceStats.totalCompetitions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Total Earnings:</span>
                      <span className="font-medium">${performanceStats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Top 3 Rate:</span>
                      <span className="font-medium">{performanceStats.top3Rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Retirement Rate:</span>
                      <span className="font-medium">{performanceStats.retirementRate.toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceStats && (
            <>
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-800">{performanceStats.totalCompetitions}</div>
                      <div className="text-sm text-stone-600">Total Starts</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{performanceStats.top3Rate.toFixed(1)}%</div>
                      <div className="text-sm text-stone-600">Top 3 Rate</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{performanceStats.retirementRate.toFixed(1)}%</div>
                      <div className="text-sm text-stone-600">Retirement Rate</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">${performanceStats.totalEarnings.toLocaleString()}</div>
                      <div className="text-sm text-stone-600">Total Earnings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.slice(0, 10).map((result, index) => (
                      <div key={result.result_id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={result.status === 'Placed' ? 'default' : 'secondary'}>
                            {result.status === 'Placed' && result.placing ? `${result.placing}` : result.status}
                          </Badge>
                          <span className="text-sm font-medium">Class {index + 1}</span>
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
            </>
          )}
        </TabsContent>

        <TabsContent value="pedigree" className="space-y-4">
          {pedigreeInfo && (
            <>
              {/* Pedigree Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Pedigree Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-800">{pedigreeInfo.damCount}</div>
                      <div className="text-sm text-stone-600">Dams</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-800">{pedigreeInfo.sireCount}</div>
                      <div className="text-sm text-stone-600">Sires</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-800">{pedigreeInfo.fullSiblingCount}</div>
                      <div className="text-sm text-stone-600">Full Siblings</div>
                    </div>
                    <div className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-800">{pedigreeInfo.halfSiblingCount}</div>
                      <div className="text-sm text-stone-600">Half Siblings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family Tree */}
              <Card>
                <CardHeader>
                  <CardTitle>Family Tree</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sire Line */}
                    <div>
                      <h4 className="font-medium text-stone-700 mb-2">Sire Line</h4>
                      <div className="pl-4 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Sire:</span> {horse.sire_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-stone-600 pl-4">
                          <span className="font-medium">Grandsire:</span> [Grandsire Name]
                        </div>
                      </div>
                    </div>

                    {/* Dam Line */}
                    <div>
                      <h4 className="font-medium text-stone-700 mb-2">Dam Line</h4>
                      <div className="pl-4 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Dam:</span> {horse.dam_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-stone-600 pl-4">
                          <span className="font-medium">Granddam:</span> [Granddam Name]
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {features && (
            <>
              {/* Individual Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Individual Performance Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.individual.total_entered_yo5}</div>
                      <div className="text-xs text-stone-600">Total Entered (Age 5)</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.individual.avg_height_cm_yo5.toFixed(1)}cm</div>
                      <div className="text-xs text-stone-600">Avg Height</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.individual.top3_rate_yo5 * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Top 3 Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.individual.retire_rate_yo5 * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Retirement Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">${features.individual.earn_per_start_yo5.toFixed(0)}</div>
                      <div className="text-xs text-stone-600">Earn/Start</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.individual.dnp_rate_yo5 * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">DNP Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pedigree Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Pedigree Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.pedigree.champion_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Champion Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.pedigree.top3_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Top 3 Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.pedigree.avg_height_cm.toFixed(1)}cm</div>
                      <div className="text-xs text-stone-600">Avg Height</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.pedigree.progeny_top3_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Progeny Top 3</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.pedigree.progeny_champion_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Progeny Champions</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.pedigree.damline_production_index.toFixed(2)}</div>
                      <div className="text-xs text-stone-600">Damline Index</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sibling Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Sibling Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.siblings.full_siblings_count}</div>
                      <div className="text-xs text-stone-600">Full Siblings</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.siblings.half_siblings_count}</div>
                      <div className="text-xs text-stone-600">Half Siblings</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.siblings.sib_top3_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Sib Top 3 Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{(features.siblings.sib_champion_rate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-stone-600">Sib Champion Rate</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.siblings.best_tier}</div>
                      <div className="text-xs text-stone-600">Best Tier</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-lg font-bold text-stone-800">{features.siblings.sib_avg_height_cm.toFixed(1)}cm</div>
                      <div className="text-xs text-stone-600">Sib Avg Height</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
