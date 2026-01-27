import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getLLMPrediction } from "@/lib/llm"
import type { Prediction } from "@/lib/types"

const MODELS_TO_RUN = ["gpt-4", "gpt-4o", "haiku"]

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 })
    }

    const metadata = Object.entries(answers).map(([question, answer]) => ({
      question,
      answer,
    }))

    const surveyEntry = {
      user_study_id: "online-survey-user",
      metadata,
    }

    const predictions: Prediction[] = await Promise.all(
      MODELS_TO_RUN.map(model => getLLMPrediction(surveyEntry, model))
    )

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error("Survey Prediction API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
