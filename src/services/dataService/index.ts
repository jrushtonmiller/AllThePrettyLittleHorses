// Data Service Layer for Equine Intelligence FEI Champion Predictor
// Manages all data operations, caching, and API interactions

import { 
  Horse, 
  Event, 
  Class, 
  Result, 
  Relative, 
  FEIRanking, 
  Prediction,
  HorseFeatures
} from '../../types/database';

export class DataService {
  private static instance: DataService;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Cache management
  private setCache(key: string, data: any, duration?: number): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + (duration || this.CACHE_DURATION));
  }

  private getCache(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  // Horse data operations
  async getHorses(filters?: {
    country?: string;
    sex?: string;
    breed?: string;
    ageRange?: { min: number; max: number };
  }): Promise<Horse[]> {
    const cacheKey = `horses_${JSON.stringify(filters)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // In production, this would query a database
    // For now, return mock data
    const horses = await this.generateMockHorses(filters);
    this.setCache(cacheKey, horses);
    return horses;
  }

  async getHorseById(horseId: string): Promise<Horse | null> {
    const cacheKey = `horse_${horseId}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const horses = await this.getHorses();
    const horse = horses.find(h => h.horse_id === horseId) || null;
    if (horse) {
      this.setCache(cacheKey, horse);
    }
    return horse;
  }

  async searchHorses(query: string): Promise<Horse[]> {
    const cacheKey = `search_${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const horses = await this.getHorses();
    const filtered = horses.filter(horse => 
      horse.name.toLowerCase().includes(query.toLowerCase()) ||
      horse.dam_name?.toLowerCase().includes(query.toLowerCase()) ||
      horse.sire_name?.toLowerCase().includes(query.toLowerCase())
    );
    
    this.setCache(cacheKey, filtered);
    return filtered;
  }

  // Results data operations
  async getResults(horseId?: string, filters?: {
    dateRange?: { start: string; end: string };
    discipline?: string;
    status?: string;
  }): Promise<Result[]> {
    const cacheKey = `results_${horseId}_${JSON.stringify(filters)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const results = await this.generateMockResults(horseId, filters);
    this.setCache(cacheKey, results);
    return results;
  }

  // Relatives data operations
  async getRelatives(horseId: string): Promise<Relative[]> {
    const cacheKey = `relatives_${horseId}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const relatives = await this.generateMockRelatives(horseId);
    this.setCache(cacheKey, relatives);
    return relatives;
  }

  // FEI Rankings operations
  async getFEIRankings(year?: number, discipline?: string): Promise<FEIRanking[]> {
    const cacheKey = `rankings_${year}_${discipline}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const rankings = await this.generateMockRankings(year, discipline);
    this.setCache(cacheKey, rankings);
    return rankings;
  }

  // Predictions operations
  async getPredictions(horseIds?: string[]): Promise<Prediction[]> {
    const cacheKey = `predictions_${horseIds?.join(',')}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const predictions = await this.generateMockPredictions(horseIds);
    this.setCache(cacheKey, predictions);
    return predictions;
  }

  async savePrediction(prediction: Prediction): Promise<void> {
    // In production, save to database
    console.log('Saving prediction:', prediction);
  }

  // Horse features operations
  async getHorseFeatures(horseId: string, asofDate: string): Promise<HorseFeatures | null> {
    const cacheKey = `features_${horseId}_${asofDate}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const horse = await this.getHorseById(horseId);
    if (!horse) return null;

    const results = await this.getResults(horseId);
    const relatives = await this.getRelatives(horseId);
    const rankings = await this.getFEIRankings();

    // In production, use the feature engineering engine
    const features = await this.generateMockFeatures(horse, results, relatives, rankings, asofDate);
    this.setCache(cacheKey, features);
    return features;
  }

  // Statistics and analytics
  async getStatistics(): Promise<{
    totalHorses: number;
    totalResults: number;
    totalPredictions: number;
    averagePredictionScore: number;
    topPerformingCountries: { country: string; count: number }[];
    topPerformingBreeds: { breed: string; count: number }[];
  }> {
    const cacheKey = 'statistics';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const horses = await this.getHorses();
    const predictions = await this.getPredictions();
    
    const stats = {
      totalHorses: horses.length,
      totalResults: horses.length * 25, // Mock
      totalPredictions: predictions.length,
      averagePredictionScore: predictions.reduce((sum, p) => sum + p.p_champion, 0) / predictions.length,
      topPerformingCountries: this.calculateTopCountries(horses),
      topPerformingBreeds: this.calculateTopBreeds(horses)
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  // Mock data generators (replace with real database queries in production)
  private async generateMockHorses(filters?: any): Promise<Horse[]> {
    const horses: Horse[] = [
      {
        horse_id: '1',
        name: 'HELLO KITTY CAT',
        registration_number: 'USA123456',
        fei_id: 'FEI001',
        usef_id: 'USEF001',
        sex: 'Mare',
        breed: 'Warmblood',
        dob: '2019-03-15',
        owner: 'ABC Stables',
        trainer: 'John Smith',
        height_hands: 16.2,
        height_cm: 165,
        dam_name: 'KITTY CAT',
        sire_name: 'HELLO WORLD',
        country: 'USA'
      },
      {
        horse_id: '2',
        name: 'EZY-DREAM',
        registration_number: 'GER789012',
        fei_id: 'FEI002',
        sex: 'Gelding',
        breed: 'Holsteiner',
        dob: '2019-01-20',
        owner: 'German Equestrian Center',
        trainer: 'Maria Schmidt',
        height_hands: 16.1,
        height_cm: 163,
        dam_name: 'DREAM GIRL',
        sire_name: 'EASY RIDER',
        country: 'GER'
      },
      {
        horse_id: '3',
        name: 'PALO DUKE',
        registration_number: 'NED345678',
        fei_id: 'FEI003',
        sex: 'Stallion',
        breed: 'KWPN',
        dob: '2019-05-10',
        owner: 'Dutch Jumping Stables',
        trainer: 'Hans van der Berg',
        height_hands: 16.3,
        height_cm: 167,
        dam_name: 'PALO ALTO',
        sire_name: 'DUKE OF WELLINGTON',
        country: 'NED'
      },
      {
        horse_id: '4',
        name: 'MLB GOODNESS GRACIOUS',
        registration_number: 'GER901234',
        fei_id: 'FEI004',
        sex: 'Mare',
        breed: 'Hanoverian',
        dob: '2019-02-28',
        owner: 'Bavarian Equestrian',
        trainer: 'Klaus Weber',
        height_hands: 16.0,
        height_cm: 162,
        dam_name: 'GRACIOUS LADY',
        sire_name: 'MLB CHAMPION',
        country: 'GER'
      },
      {
        horse_id: '5',
        name: 'LAURILAN VALOS',
        registration_number: 'IRL567890',
        fei_id: 'FEI005',
        sex: 'Gelding',
        breed: 'Irish Sport Horse',
        dob: '2019-04-12',
        owner: 'Irish Jumping Academy',
        trainer: 'Sean O\'Connor',
        height_hands: 16.2,
        height_cm: 165,
        dam_name: 'LAURILAN LADY',
        sire_name: 'VALOS STAR',
        country: 'IRL'
      }
    ];

    // Apply filters
    if (filters) {
      return horses.filter(horse => {
        if (filters.country && horse.country !== filters.country) return false;
        if (filters.sex && horse.sex !== filters.sex) return false;
        if (filters.breed && horse.breed !== filters.breed) return false;
        if (filters.ageRange) {
          const age = this.calculateAge(horse.dob);
          if (age < filters.ageRange.min || age > filters.ageRange.max) return false;
        }
        return true;
      });
    }

    return horses;
  }

  private async generateMockResults(horseId?: string, filters?: any): Promise<Result[]> {
    // Generate mock results for demonstration
    const results: Result[] = [];
    
    for (let i = 0; i < 50; i++) {
      results.push({
        result_id: `result_${i}`,
        horse_id: horseId || `horse_${Math.floor(Math.random() * 5) + 1}`,
        class_id: `class_${i}`,
        placing: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : undefined,
        status: this.getRandomStatus(),
        faults: Math.random() > 0.5 ? Math.floor(Math.random() * 8) : 0,
        time_seconds: Math.random() > 0.3 ? 60 + Math.random() * 30 : undefined,
        earnings_usd: Math.random() > 0.4 ? Math.floor(Math.random() * 5000) : 0,
        source: ['FEI', 'USEF', 'SGL'][Math.floor(Math.random() * 3)] as any,
        result_raw_status: 'Mock status'
      });
    }

    return results;
  }

  private async generateMockRelatives(horseId: string): Promise<Relative[]> {
    // Generate mock relatives
    const relatives: Relative[] = [
      { horse_id, relative_horse_id: 'dam_1', relationship: 'dam' },
      { horse_id, relative_horse_id: 'sire_1', relationship: 'sire' },
      { horse_id, relative_horse_id: 'grandsire_1', relationship: 'grandsire' },
      { horse_id, relative_horse_id: 'granddam_1', relationship: 'granddam' },
      { horse_id, relative_horse_id: 'sibling_1', relationship: 'full_sibling' },
      { horse_id, relative_horse_id: 'sibling_2', relationship: 'half_sibling' },
      { horse_id, relative_horse_id: 'sibling_3', relationship: 'half_sibling' }
    ];

    return relatives;
  }

  private async generateMockRankings(year?: number, discipline?: string): Promise<FEIRanking[]> {
    const rankings: FEIRanking[] = [];
    
    for (let i = 1; i <= 100; i++) {
      rankings.push({
        horse_id: `horse_${i}`,
        year: year || 2024,
        discipline: discipline || 'Show Jumping',
        rank_position: i,
        present_flag: true
      });
    }

    return rankings;
  }

  private async generateMockPredictions(horseIds?: string[]): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    const targetHorses = horseIds || ['1', '2', '3', '4', '5'];
    
    targetHorses.forEach((horseId, index) => {
      const probability = 0.1 + (Math.random() * 0.8); // 10% to 90%
      predictions.push({
        horse_id: horseId,
        asof_date: new Date().toISOString().split('T')[0],
        model_version: '1.0.0',
        p_champion: probability,
        rank: index + 1,
        explanation: [
          `Strong early performance with ${(probability * 100).toFixed(1)}% champion potential`,
          'Excellent pedigree with proven champion lineage',
          'Consistent top-3 finish rate in early competitions'
        ]
      });
    });

    return predictions.sort((a, b) => b.p_champion - a.p_champion);
  }

  private async generateMockFeatures(
    horse: Horse, 
    results: Result[], 
    relatives: Relative[], 
    rankings: FEIRanking[], 
    asofDate: string
  ): Promise<HorseFeatures> {
    // Generate mock features based on horse data
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      individual: {
        horse_id: horse.horse_id,
        asof_date,
        total_entered_yo5: results.length,
        avg_height_cm_yo5: 150 + Math.random() * 20,
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
        horse_id: horse.horse_id,
        asof_date,
        champion_rate: Math.random() * 0.5,
        top3_rate: Math.random() * 0.6,
        avg_height_cm: 150 + Math.random() * 20,
        progeny_top3_rate: Math.random() * 0.4,
        progeny_champion_rate: Math.random() * 0.2,
        damline_production_index: Math.random(),
        inbreeding_coefficient: Math.random() * 0.1
      },
      siblings: {
        horse_id: horse.horse_id,
        asof_date,
        full_siblings_count: Math.floor(Math.random() * 5),
        half_siblings_count: Math.floor(Math.random() * 10),
        sib_top3_rate: Math.random() * 0.5,
        sib_champion_rate: Math.random() * 0.3,
        best_tier: ['Elite', 'Second-Tier', 'Regional', 'None'][Math.floor(Math.random() * 4)] as any,
        sib_avg_height_cm: 150 + Math.random() * 20
      },
      context: {
        horse_id: horse.horse_id,
        asof_date,
        discipline: 'Show Jumping',
        region: horse.country === 'USA' ? 'North America' : 'Europe',
        level_bucket: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        competition_strength_index: Math.random(),
        entries_normalization: Math.random()
      }
    };
  }

  private getRandomStatus(): 'Placed' | 'R' | 'E' | 'DNP' {
    const rand = Math.random();
    if (rand < 0.05) return 'R';
    if (rand < 0.1) return 'E';
    if (rand < 0.4) return 'DNP';
    return 'Placed';
  }

  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private calculateTopCountries(horses: Horse[]): { country: string; count: number }[] {
    const countryCount: { [key: string]: number } = {};
    horses.forEach(horse => {
      countryCount[horse.country] = (countryCount[horse.country] || 0) + 1;
    });
    
    return Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateTopBreeds(horses: Horse[]): { breed: string; count: number }[] {
    const breedCount: { [key: string]: number } = {};
    horses.forEach(horse => {
      if (horse.breed) {
        breedCount[horse.breed] = (breedCount[horse.breed] || 0) + 1;
      }
    });
    
    return Object.entries(breedCount)
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
