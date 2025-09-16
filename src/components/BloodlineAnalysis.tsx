import { TrendingUp, Download, FileText, BarChart3, Percent, Search, GitCompare } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function BloodlineAnalysis() {
  const comparisons = [
    {
      prospect: "Thunder's Legacy",
      champion: "Valegro",
      similarity: 92,
      commonAncestors: ["Negro", "Gribaldi", "Pericles xx"],
      strength: "Exceptional movement genes",
    },
    {
      prospect: "Royal Prospect", 
      champion: "Totilas",
      similarity: 88,
      commonAncestors: ["Gribaldi", "Kostolany", "Flemmingh"],
      strength: "Superior athletic ability",
    },
    {
      prospect: "Midnight Promise",
      champion: "Blue Hors Matine",
      similarity: 85,
      commonAncestors: ["Don Schufro", "Blue Hors Don Romantic", "Sandro Hit"],
      strength: "Strong competition bloodline",
    },
  ];

  const analysisTools = [
    {
      title: "Pedigree Generator",
      description: "Generate detailed 5-generation pedigree charts",
      icon: FileText,
      action: "Generate Report",
    },
    {
      title: "Bloodline Matching",
      description: "Compare prospect bloodlines with champions",
      icon: GitCompare,
      action: "Run Analysis",
    },
    {
      title: "Performance Prediction",
      description: "AI-powered potential assessment based on lineage",
      icon: TrendingUp,
      action: "Predict Performance",
    },
    {
      title: "Export Analysis",
      description: "Download detailed reports and data exports",
      icon: Download,
      action: "Export Data",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1719919712798-38fc5717424b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2xsaW5nJTIwaG9yc2UlMjBwYXN0dXJlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc1Nzg5NDc5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Rolling Landscape"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold mb-4">Bloodline Analysis</h2>
            <p className="text-lg text-stone-200 max-w-2xl">
              Advanced genetic analysis to match prospect horses with champion bloodlines
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analysisTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card key={index} className="border-stone-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span>{tool.title}</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {tool.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search Section */}
      <Card className="border-stone-200 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-emerald-600" />
            <span>Bloodline Comparison</span>
          </CardTitle>
          <CardDescription>
            Compare any prospect horse with champion bloodlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Prospect Horse
              </label>
              <Input
                placeholder="Select or search prospect horse..."
                className="bg-stone-50 border-stone-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Champion Reference
              </label>
              <Input
                placeholder="Select or search champion horse..."
                className="bg-stone-50 border-stone-200"
              />
            </div>
          </div>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            Analyze Bloodline Match
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-stone-800">Recent Analysis Results</h3>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </Button>
        </div>

        {comparisons.map((comparison, index) => (
          <Card key={index} className="border-stone-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Comparison Overview */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-stone-800">
                        {comparison.prospect} × {comparison.champion}
                      </h4>
                      <p className="text-sm text-stone-600">{comparison.strength}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Percent className="w-4 h-4 text-emerald-600" />
                        <span className="text-2xl font-semibold text-emerald-600">
                          {comparison.similarity}%
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Bloodline Match</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-stone-600 mb-1">
                      <span>Bloodline Similarity</span>
                      <span>{comparison.similarity}%</span>
                    </div>
                    <Progress value={comparison.similarity} className="h-2" />
                  </div>

                  {/* Common Ancestors */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-stone-700 mb-2">Common Ancestors:</p>
                    <div className="flex flex-wrap gap-2">
                      {comparison.commonAncestors.map((ancestor, i) => (
                        <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">
                          {ancestor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analysis Chart Placeholder */}
                <div className="w-full lg:w-64">
                  <div className="bg-stone-50 rounded-lg p-4 h-48 flex items-center justify-center border border-stone-200">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-sm text-stone-500">Bloodline Chart</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-stone-200">
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>View Pedigree</span>
                </Button>
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Overview */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-stone-800">247</div>
            <p className="text-sm text-stone-600">Bloodline comparisons completed</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">High Potential Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600">32</div>
            <p className="text-sm text-stone-600">Prospects with 90+ similarity</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">156</div>
            <p className="text-sm text-stone-600">Pedigree and analysis reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}