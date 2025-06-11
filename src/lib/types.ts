
export interface FoodEntry {
  id: string;
  timestamp: string; // ISO string - Creation time, should not be editable
  foodItems: string;
  photo?: string; // base64 encoded image string or a placeholder URL
}

export type SymptomCategory = 'Hautreaktionen' | 'Magen-Darm' | 'Atmung' | 'Allgemeinzustand';
export const symptomCategories: SymptomCategory[] = ['Hautreaktionen', 'Magen-Darm', 'Atmung', 'Allgemeinzustand'];

export type SymptomSeverity = 'leicht' | 'mittel' | 'schwer';
export const symptomSeverities: SymptomSeverity[] = ['leicht', 'mittel', 'schwer'];


export interface SymptomEntry {
  id: string;
  loggedAt: string; // ISO string for when it was logged - Creation time, should not be editable
  symptom: string;
  category: SymptomCategory;
  severity: SymptomSeverity;
  startTime: string; // ISO string for local time intended by user - This IS editable
  duration: string; // e.g., "2 Stunden", "30 Minuten", "anhaltend"
  linkedFoodEntryId?: string; // ID of the linked food entry
}

export interface UserProfile {
  name?: string;
  notes?: string;
}

export interface AiSuggestion {
  possibleTriggers: string[];
  reasoning: string;
}

