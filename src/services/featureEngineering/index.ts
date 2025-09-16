// Feature Engineering Pipeline for Equine Intelligence FEI Champion Predictor
// Implements the blueprint requirements for individual, pedigree, and sibling features

import { 
  Horse, 
  Result, 
  Relative, 
  FEIRanking,
  IndividualFeatures,
  PedigreeFeatures,
  SiblingFeatures,
  ContextFeatures,
  HorseFeatures
} from '../../types/database';

export class FeatureEngineeringEngine {
  
  // Individual Features (as of end of age 5)
  calculateIndividualFeatures(
    horse: Horse, 
    results: Result[], 
    asofDate: string
  ): IndividualFeatures {
    const horseResults = results.filter(r => r.horse_id === horse.horse_id);
    const age5Cutoff = this.calculateAge5Date(horse.dob, asofDate);
    const age5Results = horseResults.filter(r => r.result_id <= age5Cutoff);
    
    const totalEntered = age5Results.length;
    const placedResults = age5Results.filter(r => r.status === 'Placed');
    const dnpResults = age5Results.filter(r => r.status === 'DNP');
    const retiredResults = age5Results.filter(r => r.status === 'R');
    const eliminatedResults = age5Results.filter(r => r.status === 'E');
    const top3Results = placedResults.filter(r => r.placing && r.placing <= 3);
    
    // Calculate rates
    const dnpRate = totalEntered > 0 ? dnpResults.length / totalEntered : 0;
    const retireRate = totalEntered > 0 ? retiredResults.length / totalEntered : 0;
    const top3Rate = totalEntered > 0 ? top3Results.length / totalEntered : 0;
    
    // Calculate earnings per start
    const totalEarnings = age5Results.reduce((sum, r) => sum + (r.earnings_usd || 0), 0);
    const earnPerStart = totalEntered > 0 ? totalEarnings / totalEntered : 0;
    
    // Calculate average jump height (from class heights)
    const heights = age5Results.map(r => r.class_id); // Would need to join with classes table
    const avgHeight = heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 0;
    
    // Calculate 6/12 month deltas (simplified)
    const sixMonthsAgo = new Date(asofDate);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const twelveMonthsAgo = new Date(asofDate);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    // Simplified delta calculations (would need more sophisticated logic)
    const height6moDelta = 0; // Placeholder
    const height12moDelta = 0; // Placeholder
    const performance6moDelta = 0; // Placeholder
    const performance12moDelta = 0; // Placeholder
    
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      total_entered_yo5: totalEntered,
      avg_height_cm_yo5: avgHeight,
      dnp_rate_yo5: dnpRate,
      retire_rate_yo5: retireRate,
      top3_rate_yo5: top3Rate,
      earn_per_start_yo5: earnPerStart,
      height_6mo_delta: height6moDelta,
      height_12mo_delta: height12moDelta,
      performance_6mo_delta: performance6moDelta,
      performance_12mo_delta: performance12moDelta,
      height_normalized: 0, // Placeholder
      field_size_normalized: 0 // Placeholder
    };
  }

  // Pedigree Features
  calculatePedigreeFeatures(
    horse: Horse,
    allHorses: Horse[],
    allResults: Result[],
    allRankings: FEIRanking[],
    relatives: Relative[],
    asofDate: string
  ): PedigreeFeatures {
    
    // Get lineage horses (parents, grandparents)
    const horseRelatives = relatives.filter(r => r.horse_id === horse.horse_id);
    const lineageHorseIds = horseRelatives
      .filter(r => ['dam', 'sire', 'grandsire', 'granddam'].includes(r.relationship))
      .map(r => r.relative_horse_id);
    
    const lineageHorses = allHorses.filter(h => lineageHorseIds.includes(h.horse_id));
    
    // Calculate lineage performance metrics
    let totalChampions = 0;
    let totalTop3 = 0;
    let totalHeight = 0;
    let totalProgeny = 0;
    let totalProgenyTop3 = 0;
    let totalProgenyChampions = 0;
    
    lineageHorses.forEach(lineageHorse => {
      // Check if lineage horse was ever a champion (Top-100)
      const lineageRankings = allRankings.filter(r => 
        r.horse_id === lineageHorse.horse_id && r.rank_position <= 100
      );
      if (lineageRankings.length > 0) totalChampions++;
      
      // Calculate lineage horse's top 3 rate
      const lineageResults = allResults.filter(r => r.horse_id === lineageHorse.horse_id);
      const lineageTop3 = lineageResults.filter(r => 
        r.status === 'Placed' && r.placing && r.placing <= 3
      ).length;
      totalTop3 += lineageTop3 / Math.max(lineageResults.length, 1);
      
      // Calculate average height (simplified)
      totalHeight += lineageHorse.height_cm || 0;
      
      // Calculate progeny performance
      const progeny = relatives.filter(r => 
        r.relative_horse_id === lineageHorse.horse_id && r.relationship === 'offspring'
      );
      totalProgeny += progeny.length;
      
      progeny.forEach(progenyRel => {
        const progenyResults = allResults.filter(r => r.horse_id === progenyRel.horse_id);
        const progenyTop3 = progenyResults.filter(r => 
          r.status === 'Placed' && r.placing && r.placing <= 3
        ).length;
        totalProgenyTop3 += progenyTop3 / Math.max(progenyResults.length, 1);
        
        const progenyRankings = allRankings.filter(r => 
          r.horse_id === progenyRel.horse_id && r.rank_position <= 100
        );
        if (progenyRankings.length > 0) totalProgenyChampions++;
      });
    });
    
    const lineageCount = Math.max(lineageHorses.length, 1);
    
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      champion_rate: totalChampions / lineageCount,
      top3_rate: totalTop3 / lineageCount,
      avg_height_cm: totalHeight / lineageCount,
      progeny_top3_rate: totalProgeny > 0 ? totalProgenyTop3 / totalProgeny : 0,
      progeny_champion_rate: totalProgeny > 0 ? totalProgenyChampions / totalProgeny : 0,
      damline_production_index: this.calculateDamlineIndex(horse, allHorses, relatives),
      inbreeding_coefficient: this.calculateInbreedingCoefficient(horse, allHorses, relatives)
    };
  }

  // Sibling Features
  calculateSiblingFeatures(
    horse: Horse,
    allHorses: Horse[],
    allResults: Result[],
    allRankings: FEIRanking[],
    relatives: Relative[],
    asofDate: string
  ): SiblingFeatures {
    
    // Get siblings (ages 5-8 window)
    const horseRelatives = relatives.filter(r => r.horse_id === horse.horse_id);
    const siblingIds = horseRelatives
      .filter(r => ['full_sibling', 'half_sibling'].includes(r.relationship))
      .map(r => r.relative_horse_id);
    
    const siblings = allHorses.filter(h => siblingIds.includes(h.horse_id));
    
    // Filter siblings by age (5-8 years old as of asofDate)
    const age5Cutoff = new Date(asofDate);
    age5Cutoff.setFullYear(age5Cutoff.getFullYear() - 5);
    const age8Cutoff = new Date(asofDate);
    age8Cutoff.setFullYear(age8Cutoff.getFullYear() - 8);
    
    const eligibleSiblings = siblings.filter(sibling => {
      const siblingDob = new Date(sibling.dob);
      return siblingDob <= age5Cutoff && siblingDob >= age8Cutoff;
    });
    
    const fullSiblings = eligibleSiblings.filter(sibling => {
      const rel = horseRelatives.find(r => r.relative_horse_id === sibling.horse_id);
      return rel?.relationship === 'full_sibling';
    });
    
    const halfSiblings = eligibleSiblings.filter(sibling => {
      const rel = horseRelatives.find(r => r.relative_horse_id === sibling.horse_id);
      return rel?.relationship === 'half_sibling';
    });
    
    // Calculate sibling performance metrics
    let totalSiblingTop3 = 0;
    let totalSiblingChampions = 0;
    let totalSiblingHeight = 0;
    let bestTier: 'Elite' | 'Second-Tier' | 'Regional' | 'None' = 'None';
    
    eligibleSiblings.forEach(sibling => {
      const siblingResults = allResults.filter(r => r.horse_id === sibling.horse_id);
      const siblingTop3 = siblingResults.filter(r => 
        r.status === 'Placed' && r.placing && r.placing <= 3
      ).length;
      totalSiblingTop3 += siblingTop3 / Math.max(siblingResults.length, 1);
      
      const siblingRankings = allRankings.filter(r => 
        r.horse_id === sibling.horse_id
      );
      
      if (siblingRankings.length > 0) {
        const bestRank = Math.min(...siblingRankings.map(r => r.rank_position));
        if (bestRank <= 10) bestTier = 'Elite';
        else if (bestRank <= 50) bestTier = 'Second-Tier';
        else if (bestRank <= 100) bestTier = 'Regional';
        
        if (bestRank <= 100) totalSiblingChampions++;
      }
      
      totalSiblingHeight += sibling.height_cm || 0;
    });
    
    const siblingCount = Math.max(eligibleSiblings.length, 1);
    
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      full_siblings_count: fullSiblings.length,
      half_siblings_count: halfSiblings.length,
      sib_top3_rate: totalSiblingTop3 / siblingCount,
      sib_champion_rate: totalSiblingChampions / siblingCount,
      best_tier: bestTier,
      sib_avg_height_cm: totalSiblingHeight / siblingCount
    };
  }

  // Context Features
  calculateContextFeatures(
    horse: Horse,
    allResults: Result[],
    asofDate: string
  ): ContextFeatures {
    
    const horseResults = allResults.filter(r => r.horse_id === horse.horse_id);
    
    // Determine primary discipline from results
    const disciplines = horseResults.map(r => r.source); // Simplified
    const primaryDiscipline = this.getMostFrequent(disciplines) || 'Show Jumping';
    
    // Determine region from horse country
    const region = this.mapCountryToRegion(horse.country);
    
    // Calculate competition strength index (simplified)
    const competitionStrength = this.calculateCompetitionStrength(horseResults);
    
    // Calculate entries normalization
    const entriesNormalization = this.calculateEntriesNormalization(horseResults);
    
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      discipline: primaryDiscipline,
      region: region,
      level_bucket: this.determineLevelBucket(horseResults),
      competition_strength_index: competitionStrength,
      entries_normalization: entriesNormalization
    };
  }

  // Combined Feature Calculation
  calculateAllFeatures(
    horse: Horse,
    allHorses: Horse[],
    allResults: Result[],
    allRankings: FEIRanking[],
    relatives: Relative[],
    asofDate: string
  ): HorseFeatures {
    
    return {
      horse_id: horse.horse_id,
      asof_date: asofDate,
      individual: this.calculateIndividualFeatures(horse, allResults, asofDate),
      pedigree: this.calculatePedigreeFeatures(horse, allHorses, allResults, allRankings, relatives, asofDate),
      siblings: this.calculateSiblingFeatures(horse, allHorses, allResults, allRankings, relatives, asofDate),
      context: this.calculateContextFeatures(horse, allResults, asofDate)
    };
  }

  // Helper Methods
  private calculateAge5Date(dob: string, asofDate: string): string {
    const birthDate = new Date(dob);
    const asof = new Date(asofDate);
    const age5Date = new Date(birthDate);
    age5Date.setFullYear(birthDate.getFullYear() + 5);
    
    // Return the earlier of age 5 or asof date
    return age5Date < asof ? age5Date.toISOString().split('T')[0] : asofDate;
  }

  private calculateDamlineIndex(horse: Horse, allHorses: Horse[], relatives: Relative[]): number {
    // Simplified damline production index calculation
    // In production, implement full maternal line analysis
    return 0.5; // Placeholder
  }

  private calculateInbreedingCoefficient(horse: Horse, allHorses: Horse[], relatives: Relative[]): number {
    // Simplified inbreeding coefficient calculation
    // In production, implement full pedigree analysis
    return 0.0; // Placeholder
  }

  private getMostFrequent(arr: string[]): string | null {
    if (arr.length === 0) return null;
    
    const frequency: { [key: string]: number } = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private mapCountryToRegion(country: string): string {
    const regionMap: { [key: string]: string } = {
      'USA': 'North America',
      'CAN': 'North America',
      'MEX': 'North America',
      'FRA': 'Europe',
      'GER': 'Europe',
      'GBR': 'Europe',
      'IRL': 'Europe',
      'NED': 'Europe',
      'BEL': 'Europe',
      'AUS': 'Oceania',
      'NZL': 'Oceania'
    };
    
    return regionMap[country] || 'Other';
  }

  private calculateCompetitionStrength(results: Result[]): number {
    // Simplified competition strength calculation
    // In production, analyze class levels, prize money, field sizes
    return results.length / 100; // Placeholder
  }

  private calculateEntriesNormalization(results: Result[]): number {
    // Simplified entries normalization
    // In production, normalize by typical field sizes for each class level
    return 1.0; // Placeholder
  }

  private determineLevelBucket(results: Result[]): string {
    // Simplified level bucket determination
    // In production, analyze class levels and heights
    if (results.length > 50) return 'High';
    if (results.length > 20) return 'Medium';
    return 'Low';
  }
}

// Export singleton instance
export const featureEngineeringEngine = new FeatureEngineeringEngine();
