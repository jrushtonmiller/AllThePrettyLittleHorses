import React, { useState } from 'react';

const HorseResearchTool = () => {
  const [activeTab, setActiveTab] = useState('champions');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Equine Intelligence</h1>
              <p className="text-sm text-gray-600">Diamond Hunter</p>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('champions')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'champions' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Champions
              </button>
              <button
                onClick={() => setActiveTab('prospects')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'prospects' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Prospects
              </button>
              <button
                onClick={() => setActiveTab('bloodlines')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'bloodlines' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bloodlines
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Champion Database Section */}
        {activeTab === 'champions' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-elegant font-bold text-deep-forest mb-6">
                Champion Database
              </h2>
              <p className="text-xl font-modern text-earth-brown max-w-3xl mx-auto leading-relaxed">
                Upload and manage data about champion horses with proven track records. 
                Build your comprehensive database of FEI champions and elite performers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Upload Section */}
              <div className="card-luxury rounded-2xl p-8">
                <h3 className="text-3xl font-elegant font-semibold text-deep-forest mb-6">
                  Upload Champion Data
                </h3>
                <p className="text-earth-brown mb-8 font-modern">
                  Add champion horses to your database through various import methods
                </p>
                
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-soft-taupe rounded-xl p-8 text-center hover:border-sage-green transition-colors">
                    <div className="text-4xl mb-4">📄</div>
                    <h4 className="text-xl font-modern font-semibold text-deep-forest mb-2">
                      OCR PDF Import
                    </h4>
                    <p className="text-earth-brown mb-4 font-modern">
                      Upload PDF files with champion horse listings and pedigrees
                    </p>
                    <button className="btn-luxury px-8 py-3 rounded-full font-modern font-medium">
                      Upload PDF
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-soft-taupe rounded-xl p-8 text-center hover:border-sage-green transition-colors">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="text-xl font-modern font-semibold text-deep-forest mb-2">
                      Database Import
                    </h4>
                    <p className="text-earth-brown mb-4 font-modern">
                      Import from CSV or Excel files with champion data
                    </p>
                    <button className="btn-luxury px-8 py-3 rounded-full font-modern font-medium">
                      Upload File
                    </button>
                  </div>
                </div>
              </div>

              {/* Champion Listings */}
              <div className="card-luxury rounded-2xl p-8">
                <h3 className="text-3xl font-elegant font-semibold text-deep-forest mb-6">
                  Featured Champions
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-soft-taupe bg-opacity-30 rounded-xl p-6 border border-soft-taupe">
                    <h4 className="text-2xl font-elegant font-semibold text-deep-forest mb-3">
                      Thunder Bay
                    </h4>
                    <div className="space-y-2 font-modern">
                      <div className="flex justify-between">
                        <span className="text-earth-brown">FEI Level:</span>
                        <span className="text-charcoal font-semibold">Grand Prix</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-brown">Breed:</span>
                        <span className="text-charcoal font-semibold">Warmblood</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-brown">Championships:</span>
                        <span className="text-sage-green font-semibold">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-soft-taupe bg-opacity-30 rounded-xl p-6 border border-soft-taupe">
                    <h4 className="text-2xl font-elegant font-semibold text-deep-forest mb-3">
                      Starlight Express
                    </h4>
                    <div className="space-y-2 font-modern">
                      <div className="flex justify-between">
                        <span className="text-earth-brown">FEI Level:</span>
                        <span className="text-charcoal font-semibold">International</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-brown">Breed:</span>
                        <span className="text-charcoal font-semibold">Thoroughbred</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-brown">Championships:</span>
                        <span className="text-sage-green font-semibold">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prospect Horses Section */}
        {activeTab === 'prospects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-elegant font-bold text-deep-forest mb-6">
                Prospect Horses
              </h2>
              <p className="text-xl font-modern text-earth-brown max-w-3xl mx-auto leading-relaxed">
                Discover exceptional young horses with champion bloodlines and outstanding potential. 
                Find your next champion before the competition does.
              </p>
            </div>

            {/* Search and Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Search Section */}
              <div className="lg:col-span-1">
                <div className="card-luxury rounded-2xl p-8 sticky top-8">
                  <h3 className="text-2xl font-elegant font-semibold text-deep-forest mb-6">
                    Search Prospects
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-earth-brown font-modern font-medium mb-2">
                        Horse Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter horse name..."
                        className="form-input-luxury w-full px-4 py-3 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-earth-brown font-modern font-medium mb-2">
                        Sire
                      </label>
                      <input
                        type="text"
                        placeholder="Enter sire name..."
                        className="form-input-luxury w-full px-4 py-3 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-earth-brown font-modern font-medium mb-2">
                        Dam
                      </label>
                      <input
                        type="text"
                        placeholder="Enter dam name..."
                        className="form-input-luxury w-full px-4 py-3 rounded-lg"
                      />
                    </div>
                    
                    <button className="btn-luxury w-full py-4 rounded-lg font-modern font-semibold">
                      Search Prospects
                    </button>
                    
                    <div className="pt-6 border-t border-soft-taupe">
                      <h4 className="text-lg font-elegant font-semibold text-deep-forest mb-4">
                        Horse Sale Listings
                      </h4>
                      <button className="btn-secondary-luxury w-full py-3 rounded-lg font-modern font-medium mb-3">
                        View DreamHorse.com
                      </button>
                      <button className="btn-secondary-luxury w-full py-3 rounded-lg font-modern font-medium mb-3">
                        Browse HorseClicks.com
                      </button>
                      <button className="btn-secondary-luxury w-full py-3 rounded-lg font-modern font-medium">
                        Explore HorseDeals.com
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prospect Listings */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  <div className="card-luxury rounded-2xl p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-3xl font-elegant font-semibold text-deep-forest">
                        Golden Arrow
                      </h4>
                      <div className="bg-sage-green text-cream-beige px-4 py-2 rounded-full text-sm font-modern font-medium">
                        Available
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Age:</span>
                          <span className="text-charcoal font-modern font-semibold">5 years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Breed:</span>
                          <span className="text-charcoal font-modern font-semibold">Warmblood</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Height:</span>
                          <span className="text-charcoal font-modern font-semibold">16.2 hands</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Sire:</span>
                          <span className="text-charcoal font-modern font-semibold">Thunder Bay</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Dam:</span>
                          <span className="text-charcoal font-modern font-semibold">Starlight Express</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Potential Score:</span>
                          <span className="text-sage-green font-modern font-bold text-xl">92/100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button className="btn-luxury px-8 py-3 rounded-lg font-modern font-semibold">
                        Email Owner About Purchase
                      </button>
                      <button className="btn-secondary-luxury px-8 py-3 rounded-lg font-modern font-semibold">
                        View Full Pedigree
                      </button>
                    </div>
                  </div>

                  <div className="card-luxury rounded-2xl p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-3xl font-elegant font-semibold text-deep-forest">
                        Silver Moon
                      </h4>
                      <div className="bg-warm-brown text-cream-beige px-4 py-2 rounded-full text-sm font-modern font-medium">
                        Under Review
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Age:</span>
                          <span className="text-charcoal font-modern font-semibold">4 years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Breed:</span>
                          <span className="text-charcoal font-modern font-semibold">Thoroughbred</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Height:</span>
                          <span className="text-charcoal font-modern font-semibold">16.0 hands</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Sire:</span>
                          <span className="text-charcoal font-modern font-semibold">Great Tom</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Dam:</span>
                          <span className="text-charcoal font-modern font-semibold">Bonnie Scotland</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-earth-brown font-modern">Potential Score:</span>
                          <span className="text-sage-green font-modern font-bold text-xl">88/100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button className="btn-luxury px-8 py-3 rounded-lg font-modern font-semibold">
                        Email Owner About Purchase
                      </button>
                      <button className="btn-secondary-luxury px-8 py-3 rounded-lg font-modern font-semibold">
                        View Full Pedigree
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bloodline Analysis Section */}
        {activeTab === 'bloodlines' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-elegant font-bold text-deep-forest mb-6">
                Bloodline Analysis
              </h2>
              <p className="text-xl font-modern text-earth-brown max-w-3xl mx-auto leading-relaxed">
                Monitor and analyze bloodline connections between your champion database and prospect horses. 
                Discover hidden potential through genetic analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Analysis Tools */}
              <div className="card-luxury rounded-2xl p-8">
                <h3 className="text-3xl font-elegant font-semibold text-deep-forest mb-6">
                  Bloodline Analysis Tools
                </h3>
                <p className="text-earth-brown mb-8 font-modern">
                  Compare prospect horses against your champion database to identify potential matches
                </p>
                
                <div className="space-y-6">
                  <button className="btn-luxury w-full py-4 rounded-lg font-modern font-semibold">
                    Run Bloodline Analysis
                  </button>
                  
                  <button className="btn-secondary-luxury w-full py-4 rounded-lg font-modern font-semibold">
                    Generate Pedigree Reports
                  </button>
                  
                  <button className="btn-secondary-luxury w-full py-4 rounded-lg font-modern font-semibold">
                    Export Analysis Data
                  </button>
                </div>
              </div>

              {/* Match Results */}
              <div className="card-luxury rounded-2xl p-8">
                <h3 className="text-3xl font-elegant font-semibold text-deep-forest mb-6">
                  Recent Matches
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-sage-green bg-opacity-20 rounded-xl p-6 border border-sage-green">
                    <h4 className="text-xl font-elegant font-semibold text-deep-forest mb-3">
                      High Potential Match
                    </h4>
                    <p className="text-earth-brown font-modern mb-2">
                      <strong>Prospect:</strong> Golden Arrow
                    </p>
                    <p className="text-earth-brown font-modern mb-2">
                      <strong>Champion Match:</strong> Thunder Bay (92% bloodline similarity)
                    </p>
                    <p className="text-sage-green font-modern font-semibold">
                      Exceptional breeding potential detected
                    </p>
                  </div>

                  <div className="bg-warm-brown bg-opacity-20 rounded-xl p-6 border border-warm-brown">
                    <h4 className="text-xl font-elegant font-semibold text-deep-forest mb-3">
                      Strong Genetic Connection
                    </h4>
                    <p className="text-earth-brown font-modern mb-2">
                      <strong>Prospect:</strong> Silver Moon
                    </p>
                    <p className="text-earth-brown font-modern mb-2">
                      <strong>Champion Match:</strong> Bonnie Scotland (87% bloodline similarity)
                    </p>
                    <p className="text-warm-brown font-modern font-semibold">
                      Promising performance potential
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Prospect Data */}
            <div className="card-luxury rounded-2xl p-8">
              <h3 className="text-3xl font-elegant font-semibold text-deep-forest mb-6">
                Upload Prospect Data
              </h3>
              <p className="text-earth-brown mb-8 font-modern">
                Add new prospect horses to compare against your champion database
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-soft-taupe rounded-xl p-6 text-center hover:border-sage-green transition-colors">
                  <div className="text-3xl mb-3">📄</div>
                  <h4 className="text-lg font-modern font-semibold text-deep-forest mb-2">
                    OCR PDF Import
                  </h4>
                  <p className="text-earth-brown text-sm mb-4 font-modern">
                    Upload PDF files with prospect horse listings
                  </p>
                  <button className="btn-luxury px-6 py-2 rounded-lg font-modern font-medium text-sm">
                    Upload PDF
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-soft-taupe rounded-xl p-6 text-center hover:border-sage-green transition-colors">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="text-lg font-modern font-semibold text-deep-forest mb-2">
                    Database Import
                  </h4>
                  <p className="text-earth-brown text-sm mb-4 font-modern">
                    Import from CSV or Excel files
                  </p>
                  <button className="btn-luxury px-6 py-2 rounded-lg font-modern font-medium text-sm">
                    Upload File
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-soft-taupe rounded-xl p-6 text-center hover:border-sage-green transition-colors">
                  <div className="text-3xl mb-3">✏️</div>
                  <h4 className="text-lg font-modern font-semibold text-deep-forest mb-2">
                    Manual Entry
                  </h4>
                  <p className="text-earth-brown text-sm mb-4 font-modern">
                    Add individual horses manually
                  </p>
                  <button className="btn-luxury px-6 py-2 rounded-lg font-modern font-medium text-sm">
                    Add Horse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HorseResearchTool;