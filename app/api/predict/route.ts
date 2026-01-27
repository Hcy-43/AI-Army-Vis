import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getLLMPrediction } from "@/lib/llm"
import type { SurveyData, Prediction } from "@/lib/types"

const MODELS_TO_RUN = ["gpt-4", "gpt-4o", "haiku"]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const fileContent = await file.text()
    const surveyData = JSON.parse(fileContent)

    const allPredictions: Prediction[] = await Promise.all(
      surveyData.flatMap((entry: any) =>
        MODELS_TO_RUN.map(model => getLLMPrediction(entry, model))
      )
    ).then(flat => flat.flat())

    return NextResponse.json({ surveyData, predictions: allPredictions })
  } catch (error) {
    console.error("Prediction API error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON format in the uploaded file." }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
