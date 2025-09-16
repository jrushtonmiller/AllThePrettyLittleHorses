// Core database schema for Equine Intelligence FEI Champion Predictor
// Aligned with the scraping blueprint requirements

export interface Horse {
  horse_id: string;
  name: string;
  registration_number?: string;
  fei_id?: string;
  usef_id?: string;
  sex: 'Stallion' | 'Mare' | 'Gelding';
  breed?: string;
  dob: string; // YYYY-MM-DD
  owner?: string;
  trainer?: string;
  height_hands?: number;
  height_cm?: number;
  dam_name?: string;
  sire_name?: string;
  country: string;
}

export interface Event {
  event_id: string;
  name: string;
  venue: string;
  location: string;
  start_date: string; // YYYY-MM-DD
  federation: 'FEI' | 'USEF' | 'SGL' | 'OTHER';
}

export interface Class {
  class_id: string;
  event_id: string;
  date: string; // YYYY-MM-DD
  discipline: 'Show Jumping' | 'Dressage' | 'Eventing' | 'Driving' | 'Vaulting' | 'Reining';
  level_label: string;
  class_height_cm: number;
  entries: number;
}

export interface Result {
  result_id: string;
  horse_id: string;
  class_id: string;
  placing?: number;
  status: 'Placed' | 'R' | 'E' | 'DNP'; // R=Retired, E=Eliminated, DNP=Did Not Place
  faults?: number;
  time_seconds?: number;
  earnings_usd?: number;
  source: 'FEI' | 'USEF' | 'SGL' | 'OTHER';
  result_raw_status: string; // Original status for traceability
}

export interface Relative {
  horse_id: string;
  relative_horse_id: string;
  relationship: 'dam' | 'sire' | 'grandsire' | 'granddam' | 'full_sibling' | 'half_sibling' | 'offspring';
}

export interface FEIRanking {
  horse_id: string;
  year: number;
  discipline: string;
  rank_position: number;
  present_flag: boolean;
}

export interface Prediction {
  horse_id: string;
  asof_date: string; // YYYY-MM-DD
  model_version: string;
  p_champion: number; // Probability of becoming champion (0-1)
  rank?: number;
  explanation: string[];
}

// Feature Engineering Types (as of end of age 5)
export interface IndividualFeatures {
  horse_id: string;
  asof_date: string;
  
  // Individual Performance (age 0-5)
  total_entered_yo5: number;
  avg_height_cm_yo5: number;
  dnp_rate_yo5: number; // Did Not Place rate
  retire_rate_yo5: number; // Retirement rate
  top3_rate_yo5: number; // Top 3 finish rate
  earn_per_start_yo5: number; // Earnings per competition start
  
  // 6/12-month deltas
  height_6mo_delta: number;
  height_12mo_delta: number;
  performance_6mo_delta: number;
  performance_12mo_delta: number;
  
  // Normalized metrics
  height_normalized: number; // Relative to field size
  field_size_normalized: number;
}

export interface PedigreeFeatures {
  horse_id: string;
  asof_date: string;
  
  // Parents/Grandparents Performance
  champion_rate: number; // Top-100 prevalence in lineage
  top3_rate: number;
  avg_height_cm: number;
  progeny_top3_rate: number;
  progeny_champion_rate: number;
  damline_production_index: number;
  inbreeding_coefficient?: number;
}

export interface SiblingFeatures {
  horse_id: string;
  asof_date: string;
  
  // Sibling Performance (ages 5-8)
  full_siblings_count: number;
  half_siblings_count: number;
  sib_top3_rate: number;
  sib_champion_rate: number;
  best_tier: 'Elite' | 'Second-Tier' | 'Regional' | 'None';
  sib_avg_height_cm: number;
}

export interface ContextFeatures {
  horse_id: string;
  asof_date: string;
  
  // Competition Context
  discipline: string;
  region: string;
  level_bucket: string;
  competition_strength_index: number;
  entries_normalization: number;
}

// Combined feature set for modeling
export interface HorseFeatures {
  horse_id: string;
  asof_date: string;
  individual: IndividualFeatures;
  pedigree: PedigreeFeatures;
  siblings: SiblingFeatures;
  context: ContextFeatures;
}

// Model Performance Metrics
export interface ModelMetrics {
  model_version: string;
  train_date: string;
  test_date: string;
  auc_pr: number;
  brier_score: number;
  lift_at_k: number;
  top_k_precision: number;
  calibration_slope: number;
  calibration_intercept: number;
}

// Data Source Configuration
export interface DataSource {
  name: string;
  base_url: string;
  rate_limit_ms: number;
  robots_txt_url: string;
  authentication_required: boolean;
  last_scraped?: string;
  status: 'active' | 'inactive' | 'error';
}

// Scraping Job Configuration
export interface ScrapingJob {
  job_id: string;
  source: string;
  target_type: 'rankings' | 'results' | 'pedigree';
  date_range: {
    start: string;
    end: string;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  records_processed?: number;
  errors?: string[];
}
