import type { SurveyData, PredictionData, SurveySource, PredictionModel } from "./types";

// Map source names to file paths
const sourceToFile: Record<SurveySource, string> = {
  real: "real",
  "gpt-4": "gpt-4",
  "gpt-4o": "gpt-4o",
  haiku: "haiku",
};

const modelToFile: Record<PredictionModel, string> = {
  real: "real",
  "gpt-4": "gpt-4",
  "gpt-4o": "gpt-4o",
  haiku: "haiku",
};

// Cache for loaded data
const demographicCache: Map<SurveySource, SurveyData[]> = new Map();
const predictionCache: Map<string, PredictionData[]> = new Map();

export async function loadDemographicData(source: SurveySource): Promise<SurveyData[]> {
  // Check cache first
  if (demographicCache.has(source)) {
    return demographicCache.get(source)!;
  }

  const fileName = sourceToFile[source];
  const response = await fetch(`/data/demographic/${fileName}.json`);
  
  if (!response.ok) {
    console.error(`Failed to load demographic data for ${source}`);
    return [];
  }
  
  const data = await response.json();
  demographicCache.set(source, data);
  return data;
}

export async function loadPredictionData(
  demographicSource: SurveySource,
  predictionModel: PredictionModel
): Promise<PredictionData[]> {
  const cacheKey = `${demographicSource}-${predictionModel}`;
  
  // Check cache first
  if (predictionCache.has(cacheKey)) {
    return predictionCache.get(cacheKey)!;
  }

  const sourceFile = sourceToFile[demographicSource];
  const modelFile = modelToFile[predictionModel];
  // Path: /data/prediction/{model}/{demographic}.json
  const response = await fetch(`/data/prediction/${modelFile}/${sourceFile}.json`);
  
  if (!response.ok) {
    console.error(`Failed to load prediction data for ${demographicSource}/${predictionModel}`);
    return [];
  }
  
  const data = await response.json();
  predictionCache.set(cacheKey, data);
  return data;
}

// Clear cache if needed (e.g., for hot reload during development)
export function clearCache() {
  demographicCache.clear();
  predictionCache.clear();
}
