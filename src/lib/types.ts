
export interface AppSettings { // Renamed from UserProfile
  name?: string;
  notes?: string;
}

export interface UserProfile { // New: for individual user profiles
  id: string;
  name: string;
  // avatar?: string; // Future enhancement: e.g., color or initials
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
