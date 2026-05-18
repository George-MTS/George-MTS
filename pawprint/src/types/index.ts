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
