// Definiert die Struktur der Objekte, die wir speichern
interface FoodLog {
  id: string;
  date: string;
  foodItems: string[];
  photo?: string;
}

interface SymptomLog {
  id: string;
  description: string;
  category: string;
  severity: number;
  startDate: string;
  duration: number;
}

interface AnalysisResult {
  possibleTriggers: string[];
  explanation: string;
}

// Eine Hilfsfunktion, um sicher mit dem Local Storage zu arbeiten
const safeGetLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const safeSetLocalStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


// Funktionen für Essens- und Symptomprotokolle
export const getAllFoodLogs = (): FoodLog[] => safeGetLocalStorage('foodLogs', []);
export const getAllSymptomLogs = (): SymptomLog[] => safeGetLocalStorage('symptomLogs', []);

// Funktionen für die KI-Analyse-Ergebnisse
export const getAiSuggestions = (): AnalysisResult | null => safeGetLocalStorage('aiSuggestions', null);
export const saveAiSuggestions = (result: AnalysisResult) => safeSetLocalStorage('aiSuggestions', result);
export const clearAiSuggestions = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('aiSuggestions');
    }
};
