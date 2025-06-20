export interface AppSettings { // Renamed from UserProfile
  name?: string;
  notes?: string;
}

export interface UserProfile { // New: for individual user profiles
  id: string;
  name: string;
  
  // Soziodemografische Daten (alle optional)
  dateOfBirth?: string;
  gender?: 'männlich' | 'weiblich' | 'divers' | 'keine Angabe';
  weight?: number; // in kg
  height?: number; // in cm
  
  // Gesundheitsbezogene Daten
  knownAllergies?: string[]; // Bekannte Allergien
  chronicConditions?: string[]; // Chronische Erkrankungen
  medications?: string[]; // Aktuelle Medikamente
  
  // Lifestyle-Faktoren
  dietaryPreferences?: ('vegetarisch' | 'vegan' | 'glutenfrei' | 'laktosefrei' | 'andere')[];
  activityLevel?: 'niedrig' | 'mittel' | 'hoch';
  smokingStatus?: 'nie' | 'früher' | 'gelegentlich' | 'regelmäßig';
  alcoholConsumption?: 'nie' | 'selten' | 'mäßig' | 'häufig';
  
  // Weitere relevante Faktoren
  stressLevel?: 'niedrig' | 'mittel' | 'hoch';
  sleepQuality?: 'schlecht' | 'mittelmäßig' | 'gut' | 'sehr gut';
  
  // Metadaten
  createdAt?: string;
  updatedAt?: string;
  avatar?: string; // Future enhancement: e.g., color or initials
}

export interface FoodEntry {
  id: string;
  timestamp: string; 
  foodItems: string;
  photo?: string; 
  profileIds: string[]; // New: Array of UserProfile IDs
}

export type SymptomCategory = 'Hautreaktionen' | 'Magen-Darm' | 'Atmung' | 'Allgemeinzustand';
export const symptomCategories: SymptomCategory[] = ['Hautreaktionen', 'Magen-Darm', 'Atmung', 'Allgemeinzustand'];

export type SymptomSeverity = 'leicht' | 'mittel' | 'schwer';
export const symptomSeverities: SymptomSeverity[] = ['leicht', 'mittel', 'schwer'];

export interface SymptomEntry {
  id: string;
  loggedAt: string; 
  symptom: string;
  category: SymptomCategory;
  severity: SymptomSeverity;
  startTime: string; 
  duration: string; 
  linkedFoodEntryId?: string; 
  profileId: string; // New: Single UserProfile ID
}

export interface AiSuggestion {
  possibleTriggers: string[];
  reasoning: string;
}

// Neue Typen für die erweiterten Profildaten
export type Gender = 'männlich' | 'weiblich' | 'divers' | 'keine Angabe';
export type DietaryPreference = 'vegetarisch' | 'vegan' | 'glutenfrei' | 'laktosefrei' | 'andere';
export type ActivityLevel = 'niedrig' | 'mittel' | 'hoch';
export type SmokingStatus = 'nie' | 'früher' | 'gelegentlich' | 'regelmäßig';
export type AlcoholConsumption = 'nie' | 'selten' | 'mäßig' | 'häufig';
export type StressLevel = 'niedrig' | 'mittel' | 'hoch';
export type SleepQuality = 'schlecht' | 'mittelmäßig' | 'gut' | 'sehr gut';
