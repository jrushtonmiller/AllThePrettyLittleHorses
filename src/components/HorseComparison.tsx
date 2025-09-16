// Horse Comparison Component
// Allows side-by-side comparison of multiple horses with detailed metrics

import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  X, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target,
  Trophy,
  Star,
  Award,
  Activity,
  DollarSign,
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Horse, Prediction, HorseFeatures } from '../types/database';
import { dataService } from '../services/dataService';
import { HorseDetailCard } from './HorseDetailCard';

interface HorseComparisonProps {
  horseIds: string[];
  onRemoveHorse: (horseId: string) => void;
  onClearAll: () => void;
}

export function HorseComparison({ horseIds, onRemoveHorse, onClearAll }: HorseComparisonProps) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [features, setFeatures] = useState<HorseFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');

  useEffect(() => {
    if (horseIds.length > 0) {
      loadComparisonData();
    } else {
      setHorses([]);
      setPredictions([]);
      setFeatures([]);
    }
  }, [horseIds]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const [horsesData, predictionsData] = await Promise.all([
        Promise.all(horseIds.map(id => dataService.getHorseById(id))),
        dataService.getPredictions(horseIds)
      ]);

      const validHorses = horsesData.filter(h => h !== null) as Horse[];
      setHorses(validHorses);

      const validPredictions = predictionsData.filter(p => p !== null);
      setPredictions(validPredictions);

      // Load features for each horse
      const featuresData = await Promise.all(
        validHorses.map(horse => 
          dataService.getHorseFeatures(horse.horse_id, new Date().toISOString().split('T')[0])
        )
      );

      const validFeatures = featuresData.filter(f => f !== null) as HorseFeatures[];
      setFeatures(validFeatures);

    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionForHorse = (horseId: string): Prediction | null => {
    return predictions.find(p => p.horse_id === horseId) || null;
  };

  const getFeaturesForHorse = (horseId: string): HorseFeatures | null => {
    return features.find(f => f.horse_id === horseId) || null;
  };

  const getComparisonMetrics = () => {
    if (horses.length < 2) return null;

    const metrics = {
      championProbability: horses.map(horse => {
        const prediction = getPredictionForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: prediction?.p_champion || 0,
          rank: prediction?.rank || 999
        };
      }),
      top3Rate: horses.map(horse => {
        const features = getFeaturesForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: features?.individual.top3_rate_yo5 || 0
        };
      }),
      retirementRate: horses.map(horse => {
        const features = getFeaturesForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: features?.individual.retire_rate_yo5 || 0
        };
      }),
      avgHeight: horses.map(horse => {
        const features = getFeaturesForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: features?.individual.avg_height_cm_yo5 || 0
        };
      }),
      pedigreeChampionRate: horses.map(horse => {
        const features = getFeaturesForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: features?.pedigree.champion_rate || 0
        };
      }),
      siblingChampionRate: horses.map(horse => {
        const features = getFeaturesForHorse(horse.horse_id);
        return {
          horse: horse.name,
          value: features?.siblings.sib_champion_rate || 0
        };
      })
    };

    return metrics;
  };

  const getWinner = (metricData: any[], higherIsBetter: boolean = true) => {
    if (!metricData || metricData.length === 0) return null;
    
    return metricData.reduce((winner, current) => {
      if (higherIsBetter) {
        return current.value > winner.value ? current : winner;
      } else {
        return current.value < winner.value ? current : winner;
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading comparison data...</p>
        </CardContent>
      </Card>
    );
  }

  if (horses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No Horses Selected</h3>
          <p className="text-stone-600">
            Select horses from the prospect list to compare their performance and predictions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const comparisonMetrics = getComparisonMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GitCompare className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-stone-900">Horse Comparison</h2>
          <Badge variant="outline">{horses.length} horses</Badge>
        </div>
        <Button variant="outline" onClick={onClearAll}>
          Clear All
        </Button>
      </div>

      {/* Horse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {horses.map((horse) => {
          const prediction = getPredictionForHorse(horse.horse_id);
          const features = getFeaturesForHorse(horse.horse_id);
          
          return (
            <Card key={horse.horse_id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => onRemoveHorse(horse.horse_id)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{horse.name}</CardTitle>
                <CardDescription>
                  {horse.breed} • {horse.sex} • {horse.country}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Prediction Score */}
                {prediction && (
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {(prediction.p_champion * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-emerald-700">Champion Probability</div>
                    <div className="text-xs text-emerald-600">Rank #{prediction.rank}</div>
                  </div>
                )}

                {/* Key Metrics */}
                {features && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Top 3 Rate:</span>
                      <span className="font-medium">{(features.individual.top3_rate_yo5 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Retirement Rate:</span>
                      <span className="font-medium">{(features.individual.retire_rate_yo5 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Avg Height:</span>
                      <span className="font-medium">{features.individual.avg_height_cm_yo5.toFixed(1)}cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Pedigree Champion Rate:</span>
                      <span className="font-medium">{(features.pedigree.champion_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Pedigree */}
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-stone-600">Sire:</span> {horse.sire_name || 'Unknown'}
                  </div>
                  <div>
                    <span className="text-stone-600">Dam:</span> {horse.dam_name || 'Unknown'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Metrics */}
      {comparisonMetrics && horses.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Comparison Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Champion Probability Comparison */}
            <div>
              <h4 className="font-medium text-stone-700 mb-3 flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Champion Probability</span>
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.championProbability.map((item, index) => {
                  const winner = getWinner(comparisonMetrics.championProbability, true);
                  const isWinner = winner && item.horse === winner.horse;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{item.horse}</div>
                      <div className="flex-1">
                        <Progress value={item.value * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {(item.value * 100).toFixed(1)}%
                      </div>
                      {isWinner && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 3 Rate Comparison */}
            <div>
              <h4 className="font-medium text-stone-700 mb-3 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Top 3 Finish Rate</span>
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.top3Rate.map((item, index) => {
                  const winner = getWinner(comparisonMetrics.top3Rate, true);
                  const isWinner = winner && item.horse === winner.horse;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{item.horse}</div>
                      <div className="flex-1">
                        <Progress value={item.value * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {(item.value * 100).toFixed(1)}%
                      </div>
                      {isWinner && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retirement Rate Comparison (Lower is Better) */}
            <div>
              <h4 className="font-medium text-stone-700 mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Retirement Rate (Lower is Better)</span>
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.retirementRate.map((item, index) => {
                  const winner = getWinner(comparisonMetrics.retirementRate, false);
                  const isWinner = winner && item.horse === winner.horse;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{item.horse}</div>
                      <div className="flex-1">
                        <Progress value={item.value * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {(item.value * 100).toFixed(1)}%
                      </div>
                      {isWinner && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pedigree Champion Rate Comparison */}
            <div>
              <h4 className="font-medium text-stone-700 mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Pedigree Champion Rate</span>
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.pedigreeChampionRate.map((item, index) => {
                  const winner = getWinner(comparisonMetrics.pedigreeChampionRate, true);
                  const isWinner = winner && item.horse === winner.horse;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{item.horse}</div>
                      <div className="flex-1">
                        <Progress value={item.value * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {(item.value * 100).toFixed(1)}%
                      </div>
                      {isWinner && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sibling Champion Rate Comparison */}
            <div>
              <h4 className="font-medium text-stone-700 mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Sibling Champion Rate</span>
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.siblingChampionRate.map((item, index) => {
                  const winner = getWinner(comparisonMetrics.siblingChampionRate, true);
                  const isWinner = winner && item.horse === winner.horse;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{item.horse}</div>
                      <div className="flex-1">
                        <Progress value={item.value * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {(item.value * 100).toFixed(1)}%
                      </div>
                      {isWinner && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {comparisonMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">
                  {getWinner(comparisonMetrics.championProbability, true)?.horse}
                </div>
                <div className="text-sm text-emerald-700">Highest Champion Probability</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {getWinner(comparisonMetrics.top3Rate, true)?.horse}
                </div>
                <div className="text-sm text-blue-700">Best Top 3 Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {getWinner(comparisonMetrics.retirementRate, false)?.horse}
                </div>
                <div className="text-sm text-green-700">Lowest Retirement Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
