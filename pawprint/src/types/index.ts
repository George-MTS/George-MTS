export interface PetSubmission {
  petType: 'dog' | 'cat';
  petName?: string;
  breedProvided?: string;
  age?: string;
  origin?: string;
  ownerName?: string;
  twitterHandle?: string;
  traitsNotes?: string;
  imageFile: File;
}

export interface AITrait {
  label: string;
  value: string;
}

export interface AIAnalysisResult {
  breedIdentified: string;
  confidence: number;
  origin: string;
  temperament: string;
  careNotes: string;
  traits: AITrait[];
  funFact: string;
  similarBreeds: string[];
}

export interface AnalyseAPIResponse {
  success: boolean;
  submissionId?: string;
  imageUrl?: string;
  result?: AIAnalysisResult;
  error?: string;
}

export interface StatsResponse {
  totalSubmissions: number;
  uniqueBreeds: number;
  dogCount: number;
  catCount: number;
}

export interface PetProfile {
  name: string;
  gender: 'boy' | 'girl' | 'other';
  birthday: string;
  size: 'tiny' | 'medium' | 'large' | 'giant';
  weight: number;
  weightUnit: 'kg' | 'lbs';
  coat: 'fluffy' | 'smooth' | 'curly' | 'wiry';
  ears: 'floppy' | 'perky' | 'mixed';
  energy: 'couch' | 'balanced' | 'zoomies';
}

export interface BreedScanResult {
  primary_breed: string;
  secondary_breed?: string;
  breed_percentage?: string;
  coat_description: string;
  estimated_age_range: string;
  size_category: string;
  typical_temperament: string;
  common_health_considerations: string;
  fun_fact: string;
}

export interface ScanAPIResponse {
  success: boolean;
  result?: BreedScanResult;
  error?: string;
  limitReached?: boolean;
  testMode?: boolean;
}
