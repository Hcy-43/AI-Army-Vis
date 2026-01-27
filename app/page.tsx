"use client"

import { useState, useEffect } from "react"
import { SettingsPanel } from "@/components/settings-panel"
import { StatsCards } from "@/components/stats-cards"
import { DistributionChart } from "@/components/distribution-chart"
import { BreakdownChart } from "@/components/breakdown-chart"
import { SurveyTable } from "@/components/survey-table"
import { loadDemographicData, loadPredictionData } from "@/lib/data-store"
import type { SurveySource, PredictionModel, SurveyData, Prediction } from "@/lib/types"
import { PREDICTION_MODELS } from "@/lib/types"
import { BarChart3, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [surveySource, setSurveySource] = useState<SurveySource>("real")
  const [predictionModel, setPredictionModel] = useState<PredictionModel>("gpt-4o")

  // Auto-switch prediction model if "real" is selected but survey source changes
  const handleSurveySourceChange = (source: SurveySource) => {
    setSurveySource(source)
    // If switching away from "real" survey and prediction model is "real", switch to gpt-4o
    if (source !== "real" && predictionModel === "real") {
      setPredictionModel("gpt-4o")
    }
  }
  const [surveyData, setSurveyData] = useState<SurveyData[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  // Load data when settings change
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Load current selection
      const [demographic, prediction] = await Promise.all([
        loadDemographicData(surveySource),
        loadPredictionData(surveySource, predictionModel),
      ])
      
      // Load ALL predictions for all models
      const allPredictionModels = PREDICTION_MODELS.map(m => m.value).filter(model => {
        // Skip "real" predictions if survey source is not "real"
        if (model === "real" && surveySource !== "real") {
          return false
        }
        return true
      })
      const allPredictionsData = await Promise.all(
        allPredictionModels.map(model => loadPredictionData(surveySource, model))
      )
      
      // Flatten all predictions into a single array
      const flattenedPredictions = allPredictionsData.flat()
      
      setSurveyData(demographic)
      setPredictions(prediction)
      setAllPredictions(flattenedPredictions)
      setLoading(false)
    }
    fetchData()
  }, [surveySource, predictionModel])

  const hasData = surveyData.length > 0
  const hasPredictions = predictions.length > 0

  return (
    <div className="min-h-screen bg-background">

      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Settings Panel */}
        <SettingsPanel
          surveySource={surveySource}
          predictionModel={predictionModel}
          onSurveySourceChange={handleSurveySourceChange}
          onPredictionModelChange={setPredictionModel}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading data...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Cards */}
            {hasPredictions && <StatsCards predictions={predictions} />}
            
            {/* Charts Row */}
            {hasPredictions && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DistributionChart predictions={predictions} />
                <BreakdownChart surveyData={surveyData} predictions={predictions} />
              </div>
            )}
            
            {/* Survey Data Table */}
            {hasData && (
              <SurveyTable 
                surveyData={surveyData} 
                predictions={predictions}
                allPredictions={allPredictions}
                currentModel={predictionModel}
              />
            )}

            {/* No Data Message */}
            {!hasData && !hasPredictions && (
              <div className="text-center py-12 text-muted-foreground">
                No data available for this configuration. Check if the data files exist.
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Election Survey Data Visualization Dashboard
          </p>
        </div>
      </footer>
    </div>
  )
}