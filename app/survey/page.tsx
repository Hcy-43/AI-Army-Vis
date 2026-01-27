"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { CANDIDATES, PREDICTION_MODELS } from "@/lib/types"

interface Question {
  q_num: number
  q_name: string
  question_text: string
}

interface Choice {
  q_num: number
  choice_id: number
  choice_text: string
}

export default function SurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [choices, setChoices] = useState<Choice[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const questionFiles = [0, 1, 2, 13, 14, 15, 16, 17, 18, 19]
      const [questionsResponse, choicesResponse] = await Promise.all([
        fetch("/data/questions.json"),
        fetch("/data/choices.json"),
      ])
      const allQuestions = await questionsResponse.json()
      const allChoices = await choicesResponse.json()
      
      const filteredQuestions = allQuestions.filter((q: Question) => questionFiles.includes(q.q_num))
      setQuestions(filteredQuestions)
      setChoices(allChoices)
    }
    fetchData()
  }, [])

  const handleAnswerChange = (questionName: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionName]: value }))
  }

  const handlePredict = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before predicting.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/survey-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const result = await response.json()
      setPredictions(result.predictions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Prediction Survey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {questions.map(q => (
              <div key={q.q_num} className="space-y-1.5">
                <label className="text-sm font-medium leading-none">{q.question_text}</label>
                <Select onValueChange={(value) => handleAnswerChange(q.q_name, value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {choices
                      .filter(c => c.q_num === q.q_num)
                      .map(c => (
                        <SelectItem key={c.choice_id} value={c.choice_text}>
                          {c.choice_text}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button onClick={handlePredict} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Predict
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {predictions.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="items-center">
            <CardTitle>Model Predictions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map(pred => {
              const candidate = CANDIDATES[pred.llm_answer]
              const model = PREDICTION_MODELS.find(m => m.value === pred.engine)
              return (
                <Card key={pred.engine} className="text-center">
                  <CardHeader>
                    <CardTitle>{model?.label || pred.engine}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" style={{ color: candidate?.color }}>
                      {candidate?.name || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}
    </main>
  )
}