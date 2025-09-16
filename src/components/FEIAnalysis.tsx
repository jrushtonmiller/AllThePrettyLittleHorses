import React, { useState } from 'react';
import { TrendingUp, Download, FileText, BarChart3, Percent, Search, GitCompare, Target, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FEIHorse {
  id: string;
  name: string;
  rider?: string;
  rank: number;
  points: number;
  country: string;
  tier: 'Elite' | 'Second-Tier' | 'Regional';
  offspring?: number;
  successRate?: string;
  geneticValue?: string;
  searchTarget?: boolean;
}

export function FEIAnalysis() {
  const [feiInput, setFeiInput] = useState('');
  const [feiData, setFeiData] = useState<FEIHorse[]>([]);
  const [geneticData, setGeneticData] = useState<FEIHorse[]>([]);
  const [processing, setProcessing] = useState(false);

  const processFEIData = () => {
    setProcessing(true);
    
    // Simulate processing FEI data
    setTimeout(() => {
      const mockData: FEIHorse[] = [
        {
          id: '1',
          name: "DONATELLO D'AUGE",
          rider: "EPAILLARD, Julien",
          rank: 1,
          points: 155,
          country: "FRA",
          tier: 'Elite',
          offspring: 15,
          successRate: "73%",
          geneticValue: "Premium genetics - too expensive"
        },
        {
          id: '2',
          name: "DYNASTIE DE BEAUFOUR",
          rider: "MALLEVAEY, Nina",
          rank: 2,
          points: 128,
          country: "FRA",
          tier: 'Elite',
          offspring: 22,
          successRate: "81%",
          geneticValue: "Premium genetics - too expensive"
        },
        {
          id: '3',
          name: "BOND JAMESBOND DE HAY",
          rider: "WATHELET, Gregory",
          rank: 3,
          points: 126,
          country: "BEL",
          tier: 'Elite',
          offspring: 18,
          successRate: "76%",
          geneticValue: "Premium genetics - too expensive"
        },
        {
          id: '4',
          name: "THUNDER STRIKE",
          rider: "JOHNSON, Sarah",
          rank: 15,
          points: 89,
          country: "USA",
          tier: 'Second-Tier',
          offspring: 12,
          successRate: "68%",
          geneticValue: "Excellent value genetics",
          searchTarget: true
        },
        {
          id: '5',
          name: "MOONLIGHT SONATA",
          rider: "MUELLER, Hans",
          rank: 23,
          points: 76,
          country: "GER",
          tier: 'Second-Tier',
          offspring: 8,
          successRate: "65%",
          geneticValue: "Good value genetics",
          searchTarget: true
        },
        {
          id: '6',
          name: "SILVER BULLET",
          rider: "VAN DER BERG, Pieter",
          rank: 35,
          points: 62,
          country: "NED",
          tier: 'Second-Tier',
          offspring: 14,
          successRate: "71%",
          geneticValue: "Solid genetics",
          searchTarget: true
        }
      ];
      
      setFeiData(mockData);
      setGeneticData(mockData);
      setProcessing(false);
    }, 2000);
  };

  const loadSampleData = () => {
    const sampleData: FEIHorse[] = [
      {
        id: 'sample1',
        name: "Second Wind",
        rank: 12,
        points: 95,
        country: "USA",
        tier: 'Second-Tier',
        offspring: 15,
        successRate: "73%",
        geneticValue: "Target for offspring search"
      },
      {
        id: 'sample2',
        name: "Moonlight Sonata",
        rank: 28,
        points: 78,
        country: "GER",
        tier: 'Second-Tier',
        offspring: 8,
        successRate: "65%",
        geneticValue: "Good breeding potential"
      },
      {
        id: 'sample3',
        name: "Thunder Strike",
        rank: 45,
        points: 55,
        country: "NED",
        tier: 'Regional',
        offspring: 22,
        successRate: "81%",
        geneticValue: "Regional champion potential"
      }
    ];
    setGeneticData(sampleData);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite': return 'bg-red-100 text-red-800 border-red-200';
      case 'Second-Tier': return 'bg-green-100 text-green-800 border-green-200';
      case 'Regional': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Elite': return <Star className="w-4 h-4" />;
      case 'Second-Tier': return <Target className="w-4 h-4" />;
      case 'Regional': return <TrendingUp className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1719919712798-38fc5717424b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2xsaW5nJTIwaG9yc2UlMjBwYXN0dXJlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc1Nzg5NDc5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="FEI Analysis"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold mb-4">FEI Genetic Analysis</h2>
            <p className="text-lg text-stone-200 max-w-2xl">
              Advanced genetic analysis to identify target bloodlines and breeding opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Strategy: Target "Second-Tier" Champions (Ranks 11-50)</span>
        </h3>
        <p className="text-yellow-700 text-sm">
          Focus on offspring of successful but not elite horses. Great genetics without the premium price tag of Top 10 horses.
        </p>
      </div>

      {/* Analysis Tools */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-stone-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>FEI Data Import</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Import official FEI ranking data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={processFEIData}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Process FEI Data'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-stone-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <span>Genetic Matching</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Compare prospect bloodlines with champions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              Run Analysis
            </Button>
          </CardContent>
        </Card>

        <Card className="border-stone-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Performance Prediction</span>
            </CardTitle>
            <CardDescription className="text-sm">
              AI-powered potential assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              Predict Performance
            </Button>
          </CardContent>
        </Card>

        <Card className="border-stone-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Download className="w-5 h-5 text-amber-600" />
              <span>Export Analysis</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Download detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FEI Data Input */}
      <Card className="border-stone-200 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-emerald-600" />
            <span>FEI Data Import</span>
          </CardTitle>
          <CardDescription>
            Import official FEI ranking data for genetic analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                FEI Ranking Data
              </label>
              <Textarea
                value={feiInput}
                onChange={(e) => setFeiInput(e.target.value)}
                placeholder="Paste FEI ranking data here (format: rank riderId RIDER NAME horseId HORSE NAME country points)..."
                className="min-h-32 bg-stone-50 border-stone-200 font-mono text-sm"
              />
              <p className="text-xs text-stone-500 mt-2">
                Copy and paste FEI ranking data directly from the official rankings
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={processFEIData}
                disabled={processing || !feiInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processing ? 'Processing...' : 'Process Data'}
              </Button>
              <Button 
                onClick={loadSampleData}
                variant="outline"
              >
                Load Sample Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FEI Data Summary */}
      {feiData.length > 0 && (
        <Card className="border-stone-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>FEI Data Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {feiData.filter(h => h.tier === 'Elite').length}
                </div>
                <div className="text-sm text-stone-600">Elite Horses (1-10)</div>
                <div className="text-xs text-red-500">Too Expensive</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {feiData.filter(h => h.tier === 'Second-Tier').length}
                </div>
                <div className="text-sm text-stone-600">Second-Tier (11-50)</div>
                <div className="text-xs text-green-600 font-semibold">TARGET ZONE</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {feiData.filter(h => h.tier === 'Regional').length}
                </div>
                <div className="text-sm text-stone-600">Regional (51+)</div>
                <div className="text-xs text-blue-500">Lower Potential</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Genetic Analysis Results */}
      {geneticData.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-stone-800">Genetic Analysis Results</h3>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {geneticData.length} horses analyzed
            </Badge>
          </div>

          <div className="grid gap-6">
            {geneticData.map((horse) => (
              <Card key={horse.id} className={`border-stone-200 ${
                horse.tier === 'Second-Tier' ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-stone-800">{horse.name}</h4>
                        <Badge className={`${getTierColor(horse.tier)} flex items-center space-x-1`}>
                          {getTierIcon(horse.tier)}
                          <span>{horse.tier}</span>
                        </Badge>
                        {horse.searchTarget && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Target className="w-3 h-3 mr-1" />
                            Target
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-stone-600 mb-3">
                        <span>Rank: #{horse.rank}</span>
                        <span>•</span>
                        <span>FEI Points: {horse.points}</span>
                        <span>•</span>
                        <span>Country: {horse.country}</span>
                        {horse.rider && (
                          <>
                            <span>•</span>
                            <span>Rider: {horse.rider}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {horse.successRate && (
                        <div className="text-lg font-semibold text-emerald-600 mb-1">
                          {horse.successRate}
                        </div>
                      )}
                      <div className="text-sm text-stone-500">Success Rate</div>
                    </div>
                  </div>

                  {horse.geneticValue && (
                    <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                      <p className="text-sm text-stone-700">
                        <span className="font-medium">Genetic Assessment:</span> {horse.geneticValue}
                      </p>
                    </div>
                  )}

                  {horse.searchTarget && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Search Target</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Search for 5-year-old offspring of this horse in marketplace listings
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-4 border-t border-stone-200">
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>View Pedigree</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Search className="w-4 h-4" />
                      <span>Find Offspring</span>
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {geneticData.some(h => h.tier === 'Second-Tier') && (
        <Card className="border-green-200 bg-green-50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-green-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="font-semibold">1.</span>
                <span>Import USEF 5-year-old registry data to find offspring of these horses</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">2.</span>
                <span>Cross-reference with marketplace listings to find available horses</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">3.</span>
                <span>Focus on horses with these bloodlines in their pedigree</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">4.</span>
                <span>Avoid Top 10 ranked horses (too expensive)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">5.</span>
                <span>Target ranks 11-50 for optimal value/genetics ratio</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-stone-800">{geneticData.length}</div>
            <p className="text-sm text-stone-600">FEI horses processed</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Target Horses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {geneticData.filter(h => h.tier === 'Second-Tier').length}
            </div>
            <p className="text-sm text-stone-600">Second-tier champions</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Avg Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600">
              {geneticData.length > 0 ? Math.round(geneticData.reduce((sum, h) => sum + parseInt(h.successRate?.replace('%', '') || '0'), 0) / geneticData.length) : 0}%
            </div>
            <p className="text-sm text-stone-600">Breeding success</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">
              {geneticData.filter(h => h.searchTarget).length}
            </div>
            <p className="text-sm text-stone-600">Active search targets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
