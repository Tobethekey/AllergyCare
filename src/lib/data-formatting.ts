import { getFoodEntries, getSymptomEntries } from './data-service';

// Formatiert die Protokolle in einen für die KI lesbaren String
export function getFormattedLogsForAI(): { foodLog: string | null; symptomLog: string | null } {
  const allFood = getFoodEntries();
  const allSymptoms = getSymptomEntries();

  if (allFood.length === 0 && allSymptoms.length === 0) {
    return { foodLog: null, symptomLog: null };
  }

  const foodLogString = allFood.length > 0
    ? "Food Log:\n" + allFood.map(entry =>
        `- At ${new Date(entry.dateTime).toLocaleString()}, ate: ${entry.foodItems.join(', ')}`
      ).join('\n')
    : null;

  const symptomLogString = allSymptoms.length > 0
    ? "Symptom Log:\n" + allSymptoms.map(entry =>
        `- At ${new Date(entry.dateTime).toLocaleString()}, felt: ${entry.description} (Severity: ${entry.severity}/5, Category: ${entry.category})`
      ).join('\n')
    : null;

  return { foodLog: foodLogString, symptomLog: symptomLogString };
}
