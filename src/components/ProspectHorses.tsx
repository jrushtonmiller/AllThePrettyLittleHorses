import { Search, Filter, Mail, Star, MapPin, Calendar, Ruler, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ProspectHorses() {
  const prospects = [
    {
      name: "Thunder's Legacy",
      age: 5,
      breed: "Dutch Warmblood",
      discipline: "Dressage",
      height: "16.2hh",
      location: "Netherlands",
      sire: "Thunder van de Zuuthoeve",
      dam: "Elegance Elite",
      potential: 92,
      price: "€85,000",
      source: "DreamHorse",
      contact: "info@stableexcellence.nl",
    },
    {
      name: "Royal Prospect",
      age: 4,
      breed: "Hanoverian", 
      discipline: "Dressage",
      height: "16.3hh",
      location: "Germany",
      sire: "Sir Donnerhall",
      dam: "Prima Ballerina",
      potential: 89,
      price: "€72,000",
      source: "HorseClicks",
      contact: "sales@germanelite.de",
    },
    {
      name: "Midnight Promise",
      age: 6,
      breed: "Oldenburg",
      discipline: "Show Jumping", 
      height: "16.1hh", 
      location: "USA",
      sire: "Don Juan de Hus",
      dam: "Midnight Dream",
      potential: 87,
      price: "$95,000",
      source: "Facebook",
      contact: "contact@midnightstables.com",
    },
    {
      name: "Golden Arrow",
      age: 5,
      breed: "KWPN",
      discipline: "Show Jumping",
      height: "16.0hh",
      location: "Belgium",
      sire: "Emerald van 't Ruytershof",
      dam: "Caprice des Hayettes",
      potential: 91,
      price: "€95,000",
      source: "HorseClicks",
      contact: "info@belgiumjumpers.be",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1585650159754-247184315eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3NhZ2UlMjBob3JzZXxlbnwxfHx8fDE3NTc4OTQ3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Prospect Horse"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold mb-4">Prospect Horses</h2>
            <p className="text-lg text-stone-200 max-w-2xl">
              Discover exceptional young horses with champion bloodlines ready for Grand Prix development
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
        <div className="grid md:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="Search by name, sire, or dam..."
              className="pl-10 bg-stone-50 border-stone-200"
            />
          </div>
          <Select>
            <SelectTrigger className="bg-stone-50 border-stone-200">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dressage">Dressage</SelectItem>
              <SelectItem value="show-jumping">Show Jumping</SelectItem>
              <SelectItem value="eventing">Eventing</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="bg-stone-50 border-stone-200">
              <SelectValue placeholder="Age Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="4-6">4-6 years</SelectItem>
              <SelectItem value="5-7">5-7 years</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="bg-stone-50 border-stone-200">
              <SelectValue placeholder="Breed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dutch">Dutch Warmblood</SelectItem>
              <SelectItem value="hanoverian">Hanoverian</SelectItem>
              <SelectItem value="oldenburg">Oldenburg</SelectItem>
              <SelectItem value="kwpn">KWPN</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="bg-stone-50 border-stone-200">
              <SelectValue placeholder="Potential Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90+">90+ Potential</SelectItem>
              <SelectItem value="85+">85+ Potential</SelectItem>
              <SelectItem value="80+">80+ Potential</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <Filter className="w-4 h-4" />
            <span>Showing {prospects.length} prospect horses</span>
          </div>
          <Button variant="outline" size="sm">
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Prospects Grid */}
      <div className="grid gap-6">
        {prospects.map((prospect, index) => (
          <Card key={index} className="border-stone-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Horse Image Placeholder */}
                <div className="w-full lg:w-48 h-48 bg-stone-100 rounded-lg flex items-center justify-center">
                  <span className="text-stone-400">Horse Photo</span>
                </div>

                {/* Horse Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-stone-800">{prospect.name}</h3>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          {prospect.breed}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`${
                            prospect.discipline === "Dressage" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {prospect.discipline}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-stone-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{prospect.age} years</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Ruler className="w-4 h-4" />
                          <span>{prospect.height}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{prospect.location}</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-stone-500">Sire:</span>
                          <span className="ml-2 text-stone-700">{prospect.sire}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Dam:</span>
                          <span className="ml-2 text-stone-700">{prospect.dam}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>Save</span>
                    </Button>
                  </div>

                  {/* Potential Rating and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span className="text-lg font-semibold text-stone-800">{prospect.potential}</span>
                        <span className="text-sm text-stone-500">Grand Prix Potential</span>
                      </div>
                      <div className="text-lg font-semibold text-emerald-600">
                        {prospect.price}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {prospect.source}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                        onClick={() => window.open(`mailto:${prospect.contact}?subject=Interest in ${prospect.name}`, '_blank')}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Contact Owner</span>
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DreamHorse.com</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600">Last sync: 2 hours ago</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">HorseClicks.com</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600">Last sync: 1 hour ago</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Facebook Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600">Configure integration</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}