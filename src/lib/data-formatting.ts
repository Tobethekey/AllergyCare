import { getAllFoodLogs, getAllSymptomLogs } from './local-storage';

// Formatiert die Protokolle in einen für die KI lesbaren String
export function getFormattedLogsForAI(): { foodLog: string | null; symptomLog: string | null } {
  const allFood = getAllFoodLogs();
  const allSymptoms = getAllSymptomLogs();

  if (allFood.length === 0 && allSymptoms.length === 0) {
    return { foodLog: null, symptomLog: null };
  }

  const foodLogString = allFood.length > 0
    ? "Food Log:\n" + allFood.map(log =>
        `- At ${new Date(log.date).toLocaleString()}, ate: ${log.foodItems.join(', ')}`
      ).join('\n')
    : null;

  const symptomLogString = allSymptoms.length > 0
    ? "Symptom Log:\n" + allSymptoms.map(log =>
        `- At ${new Date(log.startDate).toLocaleString()}, felt: ${log.description} (Severity: ${log.severity})`
      ).join('\n')
    : null;

  return { foodLog: foodLogString, symptomLog: symptomLogString };
}
