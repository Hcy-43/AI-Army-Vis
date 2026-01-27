"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SurveyTable } from "@/components/survey-table"
import { Loader2, UploadCloud } from "lucide-react"
import type { Prediction, SurveyData } from "@/lib/types"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [surveyData, setSurveyData] = useState<SurveyData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handlePredict = async () => {
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const result = await response.json()
      setSurveyData(result.surveyData)
      setPredictions(result.predictions)

      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setFile(null) // Also clear the file state
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Upload Survey File</h2>
          <div className="flex items-center space-x-2">
            <Input type="file" onChange={handleFileChange} accept=".json" ref={fileInputRef} />
          </div>
          <Button onClick={handlePredict} disabled={!file || loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Get Predictions
          </Button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating predictions...</span>
          </div>
        )}
        {!loading && predictions.length > 0 && (
          <SurveyTable surveyData={surveyData} predictions={[]} allPredictions={predictions} />
        )}
        {!loading && predictions.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Your prediction results will appear here.
          </div>
        )}
      </main>
    </div>
  )
}
