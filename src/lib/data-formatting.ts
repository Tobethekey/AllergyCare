'use client';
import type { FoodEntry, SymptomEntry, AppSettings, UserProfile, AiSuggestion } from './types';

const FOOD_LOG_KEY = 'ALLERGYCARE_FOOD_LOGS'; // Changed prefix for uniqueness
const SYMPTOM_LOG_KEY = 'ALLERGYCARE_SYMPTOM_LOGS'; // Changed prefix
const APP_SETTINGS_KEY = 'ALLERGYCARE_APP_SETTINGS'; // Renamed from USER_PROFILE_KEY
const USER_PROFILES_KEY = 'ALLERGYCARE_USER_PROFILES'; // New key for user profiles
const AI_SUGGESTIONS_KEY = 'ALLERGYCARE_AI_SUGGESTIONS'; // Changed prefix

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
  // Update last activity timestamp
  window.localStorage.setItem('ALLERGYCARE_LAST_ACTIVITY', new Date().toISOString());
}

// User Profiles (Extended)
export const getUserProfiles = (): UserProfile[] => getFromLocalStorage(USER_PROFILES_KEY, []);

export const addUserProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile => {
  const profiles = getUserProfiles();
  const now = new Date().toISOString();
  const newProfile: UserProfile = { 
    id: crypto.randomUUID(), 
    ...profileData,
    createdAt: now,
    updatedAt: now,
  };
  saveToLocalStorage(USER_PROFILES_KEY, [...profiles, newProfile]);
  return newProfile;
};

export const updateUserProfile = (id: string, profileData: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): UserProfile | undefined => {
  const profiles = getUserProfiles();
  const profileIndex = profiles.findIndex(profile => profile.id === id);
  if (profileIndex === -1) return undefined;

  const updatedProfile: UserProfile = {
    ...profiles[profileIndex],
    ...profileData,
    updatedAt: new Date().toISOString(),
  };
  
  profiles[profileIndex] = updatedProfile;
  saveToLocalStorage(USER_PROFILES_KEY, profiles);
  return updatedProfile;
};

export const deleteUserProfile = (id: string): void => {
  let profiles = getUserProfiles();
  profiles = profiles.filter(profile => profile.id !== id);
  saveToLocalStorage(USER_PROFILES_KEY, profiles);

  // Also remove this profileId from food and symptom entries
  let foodEntries = getFoodEntries();
  foodEntries.forEach(entry => {
    entry.profileIds = entry.profileIds.filter(pid => pid !== id);
  });
  saveToLocalStorage(FOOD_LOG_KEY, foodEntries);

  let symptomEntries = getSymptomEntries();
  symptomEntries = symptomEntries.filter(entry => entry.profileId !== id); // Remove symptom if it belonged to deleted profile
  // Alternatively, set profileId to a default/null if preferred, but removing makes sense here.
  saveToLocalStorage(SYMPTOM_LOG_KEY, symptomEntries);
};

export const getUserProfileById = (id: string): UserProfile | undefined => {
  const profiles = getUserProfiles();
  return profiles.find(profile => profile.id === id);
};

// Food Entries
export const getFoodEntries = (): FoodEntry[] => getFromLocalStorage(FOOD_LOG_KEY, []);
export const addFoodEntry = (entry: Omit<FoodEntry, 'id' | 'timestamp'>): FoodEntry => {
  const entries = getFoodEntries();
  const newEntry: FoodEntry = { 
    ...entry, 
    id: crypto.randomUUID(), 
    timestamp: new Date().toISOString(),
    profileIds: entry.profileIds || [], // Ensure profileIds is initialized
  };
  saveToLocalStorage(FOOD_LOG_KEY, [...entries, newEntry]);
  return newEntry;
};
export const updateFoodEntry = (id: string, dataToUpdate: Omit<FoodEntry, 'id' | 'timestamp'>): FoodEntry | undefined => {
  const entries = getFoodEntries();
  const entryIndex = entries.findIndex(entry => entry.id === id);
  if (entryIndex === -1) return undefined;

  const updatedEntry: FoodEntry = {
    ...entries[entryIndex], 
    ...dataToUpdate, 
    profileIds: dataToUpdate.profileIds || entries[entryIndex].profileIds, // Handle profileIds update
  };
  entries[entryIndex] = updatedEntry;
  saveToLocalStorage(FOOD_LOG_KEY, entries);
  return updatedEntry;
};
export const deleteFoodEntry = (id: string): void => {
  const entries = getFoodEntries();
  saveToLocalStorage(FOOD_LOG_KEY, entries.filter(entry => entry.id !== id));
};
export const getFoodEntryById = (id: string): FoodEntry | undefined => {
  const entries = getFoodEntries();
  return entries.find(entry => entry.id === id);
};

// Symptom Entries
export const getSymptomEntries = (): SymptomEntry[] => getFromLocalStorage(SYMPTOM_LOG_KEY, []);
export const addSymptomEntry = (entry: Omit<SymptomEntry, 'id' | 'loggedAt'>): SymptomEntry => {
  const entries = getSymptomEntries();
  if (!entry.profileId) {
    // This case should ideally be prevented by the form.
    // Consider throwing an error or assigning a default if appropriate.
    console.error("Attempted to add symptom entry without a profileId.");
    // Fallback or error handling needed here if profileId is missing.
    // For now, let's assume it's provided.
  }
  const newEntry: SymptomEntry = { 
    ...entry, 
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString() 
  };
  saveToLocalStorage(SYMPTOM_LOG_KEY, [...entries, newEntry]);
  return newEntry;
};
export const updateSymptomEntry = (id: string, dataToUpdate: Omit<SymptomEntry, 'id' | 'loggedAt'>): SymptomEntry | undefined => {
  const entries = getSymptomEntries();
  const entryIndex = entries.findIndex(entry => entry.id === id);
  if (entryIndex === -1) return undefined;

  const updatedEntry: SymptomEntry = {
    ...entries[entryIndex], 
    ...dataToUpdate,
    profileId: dataToUpdate.profileId || entries[entryIndex].profileId, // Handle profileId update
  };
  entries[entryIndex] = updatedEntry;
  saveToLocalStorage(SYMPTOM_LOG_KEY, entries);
  return updatedEntry;
};
export const deleteSymptomEntry = (id: string): void => {
  const entries = getSymptomEntries();
  saveToLocalStorage(SYMPTOM_LOG_KEY, entries.filter(entry => entry.id !== id));
};

// App Settings (Renamed from UserProfile)
export const getAppSettings = (): AppSettings => getFromLocalStorage(APP_SETTINGS_KEY, { notes: '', name: '' });
export const saveAppSettings = (settings: AppSettings): void => saveToLocalStorage(APP_SETTINGS_KEY, settings);

// AI Suggestions - ERWEITERT FÜR KOMPATIBILITÄT
export const getAiSuggestions = (): AiSuggestion | null => getFromLocalStorage(AI_SUGGESTIONS_KEY, null);
export const saveAiSuggestions = (suggestions: AiSuggestion): void => saveToLocalStorage(AI_SUGGESTIONS_KEY, suggestions);
export const clearAiSuggestions = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AI_SUGGESTIONS_KEY);
  }
};

// Data validation and cleanup
export const validateAndCleanData = (): void => {
  const profiles = getUserProfiles();
  const profileIds = new Set(profiles.map(p => p.id));
  
  // Clean food entries
  const foodEntries = getFoodEntries();
  const cleanedFoodEntries = foodEntries.map(entry => ({
    ...entry,
    profileIds: entry.profileIds.filter(id => profileIds.has(id))
  }));
  saveToLocalStorage(FOOD_LOG_KEY, cleanedFoodEntries);
  
  // Clean symptom entries
  const symptomEntries = getSymptomEntries();
  const cleanedSymptomEntries = symptomEntries.filter(entry => 
    profileIds.has(entry.profileId)
  );
  saveToLocalStorage(SYMPTOM_LOG_KEY, cleanedSymptomEntries);
};

// CSV Export (erweitert für neue Profildaten)
export const exportDataToCsv = () => {
  const foodEntries = getFoodEntries();
  const symptomEntries = getSymptomEntries();
  const userProfiles = getUserProfiles();
  const profileMap = new Map(userProfiles.map(p => [p.id, p.name]));

  let csvContent = "data:text/csv;charset=utf-8,";

  // Extended User Profiles Export
  csvContent += "User Profiles\r\n";
  csvContent += "ID,Name,Date of Birth,Gender,Weight,Height,Known Allergies,Chronic Conditions,Medications,Dietary Preferences,Activity Level,Smoking Status,Alcohol Consumption,Stress Level,Sleep Quality,Created At,Updated At\r\n";
  userProfiles.forEach(profile => {
    const row = [
      profile.id,
      `"${profile.name.replace(/"/g, '""')}"`,
      profile.dateOfBirth || '',
      profile.gender || '',
      profile.weight || '',
      profile.height || '',
      `"${(profile.knownAllergies || []).join('; ').replace(/"/g, '""')}"`,
      `"${(profile.chronicConditions || []).join('; ').replace(/"/g, '""')}"`,
      `"${(profile.medications || []).join('; ').replace(/"/g, '""')}"`,
      `"${(profile.dietaryPreferences || []).join('; ').replace(/"/g, '""')}"`,
      profile.activityLevel || '',
      profile.smokingStatus || '',
      profile.alcoholConsumption || '',
      profile.stressLevel || '',
      profile.sleepQuality || '',
      profile.createdAt || '',
      profile.updatedAt || ''
    ].join(",");
    csvContent += row + "\r\n";
  });
  csvContent += "\r\n";

  csvContent += "Food Entries\r\n";
  csvContent += "ID,Timestamp,Food Items,Profile IDs,Profile Names,Photo Link\r\n";
  foodEntries.forEach(entry => {
    const profileNames = entry.profileIds.map(id => profileMap.get(id) || 'Unbekannt').join('; ');
    const row = [entry.id, entry.timestamp, `"${entry.foodItems.replace(/"/g, '""')}"`, entry.profileIds.join(';'), `"${profileNames.replace(/"/g, '""')}"` , entry.photo || ''].join(",");
    csvContent += row + "\r\n";
  });

  csvContent += "\r\nSymptom Entries\r\n";
  csvContent += "ID,Logged At,Symptom,Category,Severity,Start Time,Duration,Linked Food ID,Profile ID,Profile Name\r\n";
  symptomEntries.forEach(entry => {
    const profileName = profileMap.get(entry.profileId) || 'Unbekannt';
    const row = [entry.id, entry.loggedAt, `"${entry.symptom.replace(/"/g, '""')}"`, entry.category, entry.severity, entry.startTime, entry.duration, entry.linkedFoodEntryId || '', entry.profileId, `"${profileName.replace(/"/g, '""')}"`].join(",");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "allergy_care_data.csv");
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);
};

// KORRIGIERTE Funktion für AI Analysis - für KI-kompatible Formatierung
export const getFormattedLogsForAI = (): { foodLog: string | null, symptomLog: string | null } => {
  const foodEntries = getFoodEntries();
  const symptomEntries = getSymptomEntries();

  // Überprüfe, ob überhaupt Daten vorhanden sind
  if (foodEntries.length === 0 && symptomEntries.length === 0) {
    return { foodLog: null, symptomLog: null };
  }

  const userProfiles = getUserProfiles();
  const profileMap = new Map(userProfiles.map(p => [p.id, p.name]));

  // Formatiere Food Log für die KI
  const foodLogString = foodEntries.length > 0 
    ? foodEntries
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(entry => {
          const profileNames = entry.profileIds.map(id => profileMap.get(id) || 'Unbekanntes Profil').join(', ');
          return `- Am ${new Date(entry.timestamp).toLocaleString('de-DE')}, gegessen: ${entry.foodItems} (Profile: ${profileNames || 'Kein Profil'})`;
        }).join('\n')
    : null;

  // Formatiere Symptom Log für die KI
  const symptomLogString = symptomEntries.length > 0 
    ? symptomEntries
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .map(entry => {
          const profileName = profileMap.get(entry.profileId) || 'Unbekanntes Profil';
          let logEntry = `- Am ${new Date(entry.startTime).toLocaleString('de-DE')}, Symptom: ${entry.symptom}, Kategorie: ${entry.category}, Schweregrad: ${entry.severity}/5, Dauer: ${entry.duration} Min, Profil: ${profileName}`;
          
          if (entry.linkedFoodEntryId) {
            const linkedFood = getFoodEntryById(entry.linkedFoodEntryId);
            if (linkedFood) {
              const linkedFoodProfileNames = linkedFood.profileIds.map(id => profileMap.get(id) || 'Unbekanntes Profil').join(', ');
              logEntry += ` (möglicherweise verknüpft mit: ${linkedFood.foodItems} vom ${new Date(linkedFood.timestamp).toLocaleString('de-DE')})`;
            }
          }
          return logEntry;
        }).join('\n')
    : null;
  
  return { foodLog: foodLogString, symptomLog: symptomLogString };
};
