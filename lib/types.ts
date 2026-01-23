export interface SurveyMetadata {
  question: string
  answer: string
}

export interface SurveyData {
  user_study_id: string
  batch_id: number
  metadata: SurveyMetadata[]
}

export interface Prediction {
  userstudyid: string
  engine: string
  llm_answer: string
  llm_answer_logprob: number
}

// Alias for clarity
export type PredictionData = Prediction

export type SurveySource = "real" | "gpt-4" | "gpt-4o" | "haiku"
export type PredictionModel = "real" | "gpt-4" | "gpt-4o" | "haiku"

export const SURVEY_SOURCES: { value: SurveySource; label: string }[] = [
  { value: "real", label: "Real Survey Data" },
  { value: "gpt-4", label: "GPT-4 Generated" },
  { value: "gpt-4o", label: "GPT-4o Generated" },
  { value: "haiku", label: "Claude Haiku Generated" },
]

export const PREDICTION_MODELS: { value: PredictionModel; label: string }[] = [
  { value: "real", label: "Real (Ground Truth)" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "haiku", label: "Claude Haiku" },
]

export const CANDIDATES: Record<string, { name: string; color: string }> = {
  "1": { name: "賴清德", color: "oklch(0.65 0.18 145)" }, // Green - DPP
  "2": { name: "侯友宜", color: "oklch(0.45 0.20 250)" }, // Dark Blue - KMT
  "3": { name: "柯文哲", color: "oklch(0.70 0.19 50)" },  // Orange/Coral - TPP
}
