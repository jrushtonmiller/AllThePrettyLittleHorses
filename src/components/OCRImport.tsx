import React, { useState, useCallback } from 'react';
import { Upload, Camera, Search, Star, Map, FileText, Database, TrendingUp, Eye, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OCRResult {
  id: string;
  file: string;
  horseName: string;
  age: string;
  breed: string;
  price: string;
  location: string;
  description: string;
  seller: string;
  contact: string;
  platform: string;
  timestamp: string;
  geneticScore?: number;
  status?: string;
  addedDate?: string;
}

export function OCRImport() {
  const [dragActive, setDragActive] = useState(false);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  // Mock OCR function - in real implementation would use actual OCR API
  const processOCR = async (file: File): Promise<OCRResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData: OCRResult = {
          id: Date.now().toString() + Math.random().toString(),
          file: file.name,
          horseName: "Thunder Bay",
          age: "5 years",
          breed: "Warmblood",
          price: "$25,000",
          location: "Wellington, FL",
          description: "Beautiful 5-year-old warmblood gelding. Sire: Second Wind (FEI Level). Dam: Moonlight Sonata. Great potential for jumping.",
          seller: "Sunshine Stables",
          contact: "contact@sunshinestables.com",
          platform: "DreamHorse.com",
          timestamp: new Date().toLocaleString(),
          geneticScore: Math.floor(Math.random() * 100) + 1,
          status: 'Available',
          addedDate: new Date().toLocaleDateString()
        };
        resolve(mockData);
      }, 2000);
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    setProcessing(true);
    setProcessedCount(0);
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const ocrResult = await processOCR(file);
        setOcrResults(prev => [...prev, ocrResult]);
        setProcessedCount(i + 1);
      } catch (error) {
        console.error('OCR processing failed:', error);
      }
    }
    
    setProcessing(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const addToDatabase = (ocrResult: OCRResult) => {
    // In a real app, this would add to the main database
    console.log('Adding to database:', ocrResult);
    setOcrResults(prev => prev.filter(item => item.id !== ocrResult.id));
  };

  const removeResult = (id: string) => {
    setOcrResults(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1585650159754-247184315eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3NhZ2UlMjBob3JzZXxlbnwxfHx8fDE3NTc4OTQ3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="OCR Import"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold mb-4">OCR Import System</h2>
            <p className="text-lg text-stone-200 max-w-2xl">
              Upload screenshots from any horse sales platform. Our AI will extract all the details automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Support */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
        <h3 className="font-semibold text-blue-800 mb-2">Multi-Platform Import System</h3>
        <p className="text-blue-700 text-sm mb-4">
          Import horse listings via screenshots from any platform: Facebook, DreamHorse, EquineNow, BIGEQ, and more!
        </p>
        <div className="flex flex-wrap gap-2">
          {['Facebook Groups', 'DreamHorse', 'EquineMarket', 'BIGEQ', 'HorseClicks', 'Any Platform'].map((platform) => (
            <Badge key={platform} variant="secondary" className="bg-blue-100 text-blue-800">
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      {/* Drag and Drop Area */}
      <Card className="border-stone-200 mb-8">
        <CardContent className="p-8">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-emerald-400 bg-emerald-50 scale-105' 
                : 'border-stone-300 hover:border-stone-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-16 w-16 text-stone-400 mb-6" />
            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              Drop Screenshot Here for OCR Processing
            </h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Upload screenshots from any horse sales platform. Our advanced OCR technology will extract all the details automatically, including horse name, age, breed, price, location, and contact information.
            </p>
            
            {processing && (
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                  <span className="text-sm text-stone-600">Processing images...</span>
                </div>
                <Progress value={(processedCount / 1) * 100} className="w-64 mx-auto" />
                <p className="text-xs text-stone-500 mt-2">{processedCount} of 1 processed</p>
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-2 text-xs text-stone-500">
              <span className="bg-stone-100 px-3 py-1 rounded-full">Supports JPG, PNG, GIF</span>
              <span className="bg-stone-100 px-3 py-1 rounded-full">Batch processing</span>
              <span className="bg-stone-100 px-3 py-1 rounded-full">AI-powered extraction</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Results */}
      {ocrResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-stone-800">OCR Processing Results</h3>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {ocrResults.length} horses found
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {ocrResults.map((result) => (
              <Card key={result.id} className="border-stone-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-stone-800">{result.horseName}</h4>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {result.breed}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-500 mb-3">
                        From: {result.platform} • Processed: {result.timestamp}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeResult(result.id)}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-sm text-stone-500">Age</div>
                      <div className="font-semibold text-stone-800">{result.age}</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-sm text-stone-500">Price</div>
                      <div className="font-semibold text-emerald-600">{result.price}</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-sm text-stone-500">Location</div>
                      <div className="font-semibold text-stone-800">{result.location}</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-sm text-stone-500">Genetic Score</div>
                      <div className="font-semibold text-purple-600">{result.geneticScore}/100</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-stone-700">{result.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Contact:</span> {result.contact}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-1"
                        onClick={() => addToDatabase(result)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Add to Database</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Total Imports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">{ocrResults.length}</div>
            <p className="text-sm text-stone-600">Horses processed today</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Success Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600">98%</div>
            <p className="text-sm text-stone-600">OCR accuracy</p>
          </CardContent>
        </Card>
        
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Platforms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-600">12+</div>
            <p className="text-sm text-stone-600">Supported platforms</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-600" />
              <span>Avg Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">
              {ocrResults.length > 0 ? Math.round(ocrResults.reduce((sum, r) => sum + (r.geneticScore || 0), 0) / ocrResults.length) : 0}
            </div>
            <p className="text-sm text-stone-600">Genetic potential</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
