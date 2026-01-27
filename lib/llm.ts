import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { Prediction, SurveyData } from "./types"

const openai = new OpenAI({
  apiKey: process.env.PROJECT_OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.PROJECT_ANTHROPIC_API_KEY,
})

const MODEL_CHOICES = {
  "1": "1",
  "2": "2",
  "3": "3",
}

function getSystemPrompt(): string {
  return `You are a survey respondent simulator.
Based on the provided personal background information,
simulate this type of respondent's intuitive judgment on a single question.

Please strictly adhere to the following:
- Do not explain
- Do not comment
- Do not add background
- Only output a single Arabic numeral`
}

function getUserPrompt(entry: any): string {
  const background = entry.metadata
    .map((item: any) => `${item.question}: ${item.answer}`)
    .join("\n")

  return `Here is the background information of a respondent:

${background}

Based on the background above, please answer the following question.

Q: If tomorrow were the voting day, and the candidates for the 2024 president are Lai Ching-te, Hou Yu-ih, and Ko Wen-je, who would you vote for?

Options (output only the number):
1 = Lai Ching-te
2 = Hou Yu-ih
3 = Ko Wen-je`
}

async function getOpenAIPrediction(
  entry: any,
  model: "gpt-4" | "gpt-4o"
): Promise<Prediction> {
  const systemPrompt = getSystemPrompt()
  const userPrompt = getUserPrompt(entry)

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
    max_tokens: 5,
  })

  const choiceNumber = response.choices[0].message.content?.trim()
  const choice =
    choiceNumber && Object.keys(MODEL_CHOICES).includes(choiceNumber)
      ? MODEL_CHOICES[choiceNumber as keyof typeof MODEL_CHOICES]
      : "9" // Default to "Invalid" or "Undecided"

  return {
    userstudyid: entry.user_study_id,
    engine: model,
    llm_answer: choice,
    llm_answer_logprob: 0,
  }
}

async function getClaudePrediction(entry: any): Promise<Prediction> {
  const userPrompt = getUserPrompt(entry)

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 5,
    system: getSystemPrompt(),
    messages: [{ role: "user", content: userPrompt }],
  })

  const contentBlock = response.content[0]
  const choiceNumber =
    contentBlock && contentBlock.type === "text"
      ? contentBlock.text.trim()
      : ""
  const choice =
    choiceNumber && Object.keys(MODEL_CHOICES).includes(choiceNumber)
      ? MODEL_CHOICES[choiceNumber as keyof typeof MODEL_CHOICES]
      : "9"

  return {
    userstudyid: entry.user_study_id,
    engine: "haiku",
    llm_answer: choice,
    llm_answer_logprob: 0,
  }
}

export async function getLLMPrediction(
  entry: any,
  model: string
): Promise<Prediction> {
  switch (model) {
    case "gpt-4":
    case "gpt-4o":
      return getOpenAIPrediction(entry, model)
    case "haiku":
      return getClaudePrediction(entry)
    default:
      throw new Error(`Unsupported model: ${model}`)
  }
}
