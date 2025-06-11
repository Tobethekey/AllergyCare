'use client';
import type { FoodEntry, SymptomEntry, UserProfile, AiSuggestion } from './types';

const FOOD_LOG_KEY = 'ALLERGYLIFE_FOOD_LOGS';
const SYMPTOM_LOG_KEY = 'ALLERGYLIFE_SYMPTOM_LOGS';
const USER_PROFILE_KEY = 'ALLERGYLIFE_USER_PROFILE';
const AI_SUGGESTIONS_KEY = 'ALLERGYLIFE_AI_SUGGESTIONS';

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

// Food Entries
export const getFoodEntries = (): FoodEntry[] => getFromLocalStorage(FOOD_LOG_KEY, []);
export const addFoodEntry = (entry: Omit<FoodEntry, 'id' | 'timestamp'>): FoodEntry => {
  const entries = getFoodEntries();
  const newEntry: FoodEntry = { 
    ...entry, 
    id: crypto.randomUUID(), 
    timestamp: new Date().toISOString() 
  };
  saveToLocalStorage(FOOD_LOG_KEY, [...entries, newEntry]);
  return newEntry;
};
export const deleteFoodEntry = (id: string): void => {
  const entries = getFoodEntries();
  saveToLocalStorage(FOOD_LOG_KEY, entries.filter(entry => entry.id !== id));
};

// Symptom Entries
export const getSymptomEntries = (): SymptomEntry[] => getFromLocalStorage(SYMPTOM_LOG_KEY, []);
export const addSymptomEntry = (entry: Omit<SymptomEntry, 'id' | 'loggedAt'>): SymptomEntry => {
  const entries = getSymptomEntries();
  const newEntry: SymptomEntry = { 
    ...entry, 
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString() 
  };
  saveToLocalStorage(SYMPTOM_LOG_KEY, [...entries, newEntry]);
  return newEntry;
};
export const deleteSymptomEntry = (id: string): void => {
  const entries = getSymptomEntries();
  saveToLocalStorage(SYMPTOM_LOG_KEY, entries.filter(entry => entry.id !== id));
};

// User Profile
export const getUserProfile = (): UserProfile => getFromLocalStorage(USER_PROFILE_KEY, {});
export const saveUserProfile = (profile: UserProfile): void => saveToLocalStorage(USER_PROFILE_KEY, profile);

// AI Suggestions
export const getAiSuggestions = (): AiSuggestion | null => getFromLocalStorage(AI_SUGGESTIONS_KEY, null);
export const saveAiSuggestions = (suggestions: AiSuggestion): void => saveToLocalStorage(AI_SUGGESTIONS_KEY, suggestions);
export const clearAiSuggestions = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AI_SUGGESTIONS_KEY);
  }
};


// CSV Export
export const exportDataToCsv = () => {
  const foodEntries = getFoodEntries();
  const symptomEntries = getSymptomEntries();

  let csvContent = "data:text/csv;charset=utf-8,";

  // Food Entries Header and Data
  csvContent += "Food Entries\r\n";
  csvContent += "ID,Timestamp,Food Items,Photo Link\r\n";
  foodEntries.forEach(entry => {
    const row = [entry.id, entry.timestamp, `"${entry.foodItems.replace(/"/g, '""')}"`, entry.photo || ''].join(",");
    csvContent += row + "\r\n";
  });

  csvContent += "\r\nSymptom Entries\r\n";
  csvContent += "ID,Logged At,Symptom,Category,Severity,Start Time,Duration\r\n";
  symptomEntries.forEach(entry => {
    const row = [entry.id, entry.loggedAt, `"${entry.symptom.replace(/"/g, '""')}"`, entry.category, entry.severity, entry.startTime, entry.duration].join(",");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "allergy_life_data.csv");
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);
};

// Data for AI Analysis
export const getFormattedLogsForAI = (): { foodLog: string, symptomLog: string } => {
  const foodEntries = getFoodEntries().sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const symptomEntries = getSymptomEntries().sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const foodLog = foodEntries.map(entry => 
    `Datum: ${new Date(entry.timestamp).toLocaleString('de-DE')}, Lebensmittel: ${entry.foodItems}`
  ).join('\n');

  const symptomLog = symptomEntries.map(entry => 
    `Datum: ${new Date(entry.startTime).toLocaleString('de-DE')}, Symptom: ${entry.symptom}, Kategorie: ${entry.category}, Schweregrad: ${entry.severity}, Dauer: ${entry.duration}`
  ).join('\n');
  
  return { foodLog, symptomLog };
};
