// Advanced Champion Predictor UI Component
// Implements the blueprint requirements for shortlist, horse cards, and comparisons

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Star, 
  Search, 
  Filter, 
  Download, 
  Eye,
  GitCompare,
  AlertCircle,
  CheckCircle,
  Trophy,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { HorseFeatures, Prediction } from '../types/database';
import { predictionModelEngine } from '../services/predictionModel';
import { featureEngineeringEngine } from '../services/featureEngineering';
import { dataService } from '../services/dataService';
import { HorseDetailCard } from './HorseDetailCard';
import { HorseComparison } from './HorseComparison';

interface ProspectHorse {
  id: string;
  name: string;
  age: string;
  sex: 'Stallion' | 'Mare' | 'Gelding';
  breed?: string;
  country: string;
  dob: string;
  dam_name?: string;
  sire_name?: string;
  trainer?: string;
  owner?: string;
  features?: HorseFeatures;
  prediction?: Prediction;
}

export function ChampionPredictor() {
  const [prospects, setProspects] = useState<ProspectHorse[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterSex, setFilterSex] = useState('all');
  const [filterProbability, setFilterProbability] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [selectedHorseDetail, setSelectedHorseDetail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('prospects');

  // Initialize with data from data service
  useEffect(() => {
    loadProspects();
    setModelStatus(predictionModelEngine.getModelStatus());
  }, []);

  const loadProspects = async () => {
    try {
      const horses = await dataService.getHorses({ ageRange: { min: 4, max: 6 } });
      const sampleProspects: ProspectHorse[] = horses.map(horse => ({
        id: horse.horse_id,
        name: horse.name,
        age: '5',
        sex: horse.sex,
        breed: horse.breed || 'Unknown',
        country: horse.country,
        dob: horse.dob,
        dam_name: horse.dam_name,
        sire_name: horse.sire_name,
        trainer: horse.trainer,
        owner: horse.owner
      }));
      
      setProspects(sampleProspects);
    } catch (error) {
      console.error('Error loading prospects:', error);
      // Fallback to sample data
      const sampleProspects: ProspectHorse[] = [
        {
          id: '1',
          name: 'HELLO KITTY CAT',
          age: '5',
          sex: 'Mare',
          breed: 'Warmblood',
          country: 'USA',
          dob: '2019-03-15',
          dam_name: 'KITTY CAT',
          sire_name: 'HELLO WORLD',
          trainer: 'John Smith',
          owner: 'ABC Stables'
        },
        {
          id: '2',
          name: 'EZY-DREAM',
          age: '5',
          sex: 'Gelding',
          breed: 'Holsteiner',
          country: 'GER',
          dob: '2019-01-20',
          dam_name: 'DREAM GIRL',
          sire_name: 'EASY RIDER',
          trainer: 'Maria Schmidt',
          owner: 'German Equestrian Center'
        },
        {
          id: '3',
          name: 'PALO DUKE',
          age: '5',
          sex: 'Stallion',
          breed: 'KWPN',
          country: 'NED',
          dob: '2019-05-10',
          dam_name: 'PALO ALTO',
          sire_name: 'DUKE OF WELLINGTON',
          trainer: 'Hans van der Berg',
          owner: 'Dutch Jumping Stables'
        },
        {
          id: '4',
          name: 'MLB GOODNESS GRACIOUS',
          age: '5',
          sex: 'Mare',
          breed: 'Hanoverian',
          country: 'GER',
          dob: '2019-02-28',
          dam_name: 'GRACIOUS LADY',
          sire_name: 'MLB CHAMPION',
          trainer: 'Klaus Weber',
          owner: 'Bavarian Equestrian'
        },
        {
          id: '5',
          name: 'LAURILAN VALOS',
          age: '5',
          sex: 'Gelding',
          breed: 'Irish Sport Horse',
          country: 'IRL',
          dob: '2019-04-12',
          dam_name: 'LAURILAN LADY',
          sire_name: 'VALOS STAR',
          trainer: 'Sean O\'Connor',
          owner: 'Irish Jumping Academy'
        }
      ];

      setProspects(sampleProspects);
    }
  };

  // Analyze prospects and generate predictions
  const analyzeProspects = async () => {
    setIsAnalyzing(true);
    
    try {
      // Generate mock features for each prospect
      const featuresList: HorseFeatures[] = prospects.map(prospect => ({
        horse_id: prospect.id,
        asof_date: new Date().toISOString().split('T')[0],
        individual: {
          horse_id: prospect.id,
          asof_date: new Date().toISOString().split('T')[0],
          total_entered_yo5: Math.floor(Math.random() * 40) + 10,
          avg_height_cm_yo5: 140 + Math.random() * 20,
          dnp_rate_yo5: Math.random() * 0.3,
          retire_rate_yo5: Math.random() * 0.1,
          top3_rate_yo5: Math.random() * 0.4,
          earn_per_start_yo5: Math.random() * 1000,
          height_6mo_delta: (Math.random() - 0.5) * 10,
          height_12mo_delta: (Math.random() - 0.5) * 15,
          performance_6mo_delta: (Math.random() - 0.5) * 0.2,
          performance_12mo_delta: (Math.random() - 0.5) * 0.3,
          height_normalized: Math.random(),
          field_size_normalized: Math.random()
        },
        pedigree: {
          horse_id: prospect.id,
          asof_date: new Date().toISOString().split('T')[0],
          champion_rate: Math.random() * 0.5,
          top3_rate: Math.random() * 0.6,
          avg_height_cm: 140 + Math.random() * 20,
          progeny_top3_rate: Math.random() * 0.4,
          progeny_champion_rate: Math.random() * 0.2,
          damline_production_index: Math.random(),
          inbreeding_coefficient: Math.random() * 0.1
        },
        siblings: {
          horse_id: prospect.id,
          asof_date: new Date().toISOString().split('T')[0],
          full_siblings_count: Math.floor(Math.random() * 5),
          half_siblings_count: Math.floor(Math.random() * 10),
          sib_top3_rate: Math.random() * 0.5,
          sib_champion_rate: Math.random() * 0.3,
          best_tier: ['Elite', 'Second-Tier', 'Regional', 'None'][Math.floor(Math.random() * 4)] as any,
          sib_avg_height_cm: 140 + Math.random() * 20
        },
        context: {
          horse_id: prospect.id,
          asof_date: new Date().toISOString().split('T')[0],
          discipline: 'Show Jumping',
          region: prospect.country === 'USA' ? 'North America' : 'Europe',
          level_bucket: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          competition_strength_index: Math.random(),
          entries_normalization: Math.random()
        }
      }));

      // Generate predictions
      const newPredictions = await predictionModelEngine.predictBatch(
        featuresList,
        new Date().toISOString().split('T')[0]
      );

      setPredictions(newPredictions);

      // Update prospects with predictions
      const updatedProspects = prospects.map(prospect => {
        const prediction = newPredictions.find(p => p.horse_id === prospect.id);
        return {
          ...prospect,
          prediction,
          features: featuresList.find(f => f.horse_id === prospect.id)
        };
      });

      setProspects(updatedProspects);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter prospects based on search and filters
  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.dam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.sire_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = filterCountry === 'all' || prospect.country === filterCountry;
    const matchesSex = filterSex === 'all' || prospect.sex === filterSex;
    
    let matchesProbability = true;
    if (filterProbability !== 'all' && prospect.prediction) {
      const prob = prospect.prediction.p_champion;
      switch (filterProbability) {
        case 'high': matchesProbability = prob >= 0.7; break;
        case 'medium': matchesProbability = prob >= 0.3 && prob < 0.7; break;
        case 'low': matchesProbability = prob < 0.3; break;
      }
    }
    
    return matchesSearch && matchesCountry && matchesSex && matchesProbability;
  });

  // Sort prospects by prediction probability (if available)
  const sortedProspects = [...filteredProspects].sort((a, b) => {
    if (!a.prediction || !b.prediction) return 0;
    return b.prediction.p_champion - a.prediction.p_champion;
  });

  // Get unique countries for filter
  const countries = [...new Set(prospects.map(p => p.country))].sort();

  // Export predictions to CSV
  const exportPredictions = () => {
    const csvContent = [
      ['Horse Name', 'Age', 'Sex', 'Country', 'Probability', 'Rank', 'Explanations'].join(','),
      ...sortedProspects.map(prospect => [
        prospect.name,
        prospect.age,
        prospect.sex,
        prospect.country,
        prospect.prediction?.p_champion.toFixed(3) || 'N/A',
        prospect.prediction?.rank || 'N/A',
        `"${prospect.prediction?.explanation.join('; ') || 'Not analyzed'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'champion_predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">FEI Champion Predictor</h1>
          <p className="text-stone-600 mt-1">Predict which 5-year-old horses will become FEI champions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {modelStatus && (
            <Badge variant={modelStatus.isTrained ? "default" : "secondary"}>
              <Target className="w-3 h-3 mr-1" />
              Model v{modelStatus.version}
            </Badge>
          )}
          
          <Button 
            onClick={analyzeProspects} 
            disabled={isAnalyzing}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isAnalyzing ? (
              <>
                <BarChart3 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Prospects
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Prospects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, dam, or sire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSex} onValueChange={setFilterSex}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sex</SelectItem>
                <SelectItem value="Stallion">Stallion</SelectItem>
                <SelectItem value="Mare">Mare</SelectItem>
                <SelectItem value="Gelding">Gelding</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProbability} onValueChange={setFilterProbability}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Probability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High (≥70%)</SelectItem>
                <SelectItem value="medium">Medium (30-70%)</SelectItem>
                <SelectItem value="low">Low (&lt;30%)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportPredictions}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{prospect.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {prospect.age} year old {prospect.sex} • {prospect.country}
                  </CardDescription>
                </div>
                
                {prospect.prediction && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      {(prospect.prediction.p_champion * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-stone-500">
                      Rank #{prospect.prediction.rank}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pedigree */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-stone-700">Pedigree</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Sire:</span> {prospect.sire_name || 'Unknown'}</div>
                  <div><span className="font-medium">Dam:</span> {prospect.dam_name || 'Unknown'}</div>
                  <div><span className="font-medium">Breed:</span> {prospect.breed || 'Unknown'}</div>
                </div>
              </div>

              {/* Prediction Explanation */}
              {prospect.prediction && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-stone-700">Key Factors</h4>
                  <div className="space-y-1">
                    {prospect.prediction.explanation.slice(0, 3).map((explanation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-stone-600">{explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedHorseDetail(prospect.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    if (selectedHorses.includes(prospect.id)) {
                      setSelectedHorses(selectedHorses.filter(id => id !== prospect.id));
                    } else {
                      setSelectedHorses([...selectedHorses, prospect.id]);
                    }
                  }}
                  className={selectedHorses.includes(prospect.id) ? 'bg-emerald-50 border-emerald-200' : ''}
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {sortedProspects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No Prospects Found</h3>
            <p className="text-stone-600">
              Try adjusting your search criteria or add more prospects to analyze.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Summary */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Analysis Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-stone-800">{predictions.length}</div>
                <div className="text-sm text-stone-600">Total Prospects</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {predictions.filter(p => p.p_champion >= 0.7).length}
                </div>
                <div className="text-sm text-stone-600">High Potential</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {predictions.filter(p => p.p_champion >= 0.3 && p.p_champion < 0.7).length}
                </div>
                <div className="text-sm text-stone-600">Medium Potential</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-stone-600">
                  {predictions.filter(p => p.p_champion < 0.3).length}
                </div>
                <div className="text-sm text-stone-600">Developing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        <TabsContent value="comparison">
          <HorseComparison 
            horseIds={selectedHorses}
            onRemoveHorse={(horseId) => setSelectedHorses(selectedHorses.filter(id => id !== horseId))}
            onClearAll={() => setSelectedHorses([])}
          />
        </TabsContent>

        <TabsContent value="details">
          {selectedHorseDetail ? (
            <HorseDetailCard 
              horseId={selectedHorseDetail}
              onClose={() => setSelectedHorseDetail(null)}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No Horse Selected</h3>
                <p className="text-stone-600">
                  Click "View Details" on any prospect to see their detailed analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
