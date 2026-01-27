"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CANDIDATES } from "@/lib/types"
import type { SurveyData, Prediction } from "@/lib/types"
import { PREDICTION_MODELS } from "@/lib/types"
import { ChevronLeft, ChevronRight, Search, Eye } from "lucide-react"

interface SurveyTableProps {
  surveyData: SurveyData[]
  predictions: Prediction[] // Predictions for currently selected model (dashboard)
  allPredictions: Prediction[] // All predictions from all models (upload/survey)
  currentModel?: string // The currently selected model on the dashboard
}

export function SurveyTable({ surveyData, predictions, allPredictions, currentModel }: SurveyTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData | null>(null)
  
  const pageSize = 10
  
  // Create a map of predictions for the currently selected model (for dashboard)
  const singlePredictionMap = (predictions || []).reduce((acc, pred) => {
    acc[pred.userstudyid] = pred
    return acc
  }, {} as Record<string, Prediction>)
  
  // Group all predictions by user study id and model for the multi-model display
  const allPredictionsMap = (allPredictions || []).reduce((acc, pred) => {
    if (!acc[pred.userstudyid]) {
      acc[pred.userstudyid] = []
    }
    acc[pred.userstudyid].push(pred)
    return acc
  }, {} as Record<string, Prediction[]>)
  
  // Filter data based on search and prediction availability
  const filteredData = surveyData.filter((survey) => {
    // If a currentModel is specified (dashboard), ensure there's a prediction for it
    if (currentModel && !singlePredictionMap[survey.user_study_id]) return false
    // If no specific model (upload/survey), ensure there's at least one prediction for the survey
    if (!currentModel && allPredictionsMap[survey.user_study_id]?.length === 0) return false

    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      survey.user_study_id.toLowerCase().includes(searchLower) ||
      (survey.metadata && survey.metadata.some(m => 
        m.answer.toLowerCase().includes(searchLower) ||
        m.question.toLowerCase().includes(searchLower)
      ))
    )
  })
  
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)
  
  // Get key metadata for display
  const getMetadataValue = (survey: SurveyData, question: string) => {
    if (!survey.metadata) return "-" // Add null check for metadata
    return survey.metadata.find(m => m.question === question)?.answer || "-"
  }
  
  // Get prediction for the single selected model (dashboard)
  const getSingleModelPredictionForDisplay = (survey: SurveyData) => {
    const pred = singlePredictionMap[survey.user_study_id]
    if (!pred) return null
    return CANDIDATES[pred.llm_answer]
  }

  // Get prediction for a specific model from all predictions (upload/survey)
  const getMultiModelPredictionForDisplay = (survey: SurveyData, model: string) => {
    const surveyPredictions = allPredictionsMap[survey.user_study_id] || []
    const pred = surveyPredictions.find(p => p.engine === model)
    if (!pred) return null
    return CANDIDATES[pred.llm_answer]
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-medium">Individual Survey Data</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Age</TableHead>
                  <TableHead className="font-medium">Location</TableHead>
                  <TableHead className="font-medium">Gender</TableHead>
                  <TableHead className="font-medium">Party</TableHead>
                  {currentModel ? (
                    <TableHead className="font-medium">
                      Prediction
                      <span className="text-muted-foreground font-normal ml-1">
                        ({PREDICTION_MODELS.find(m => m.value === currentModel)?.label || currentModel})
                      </span>
                    </TableHead>
                  ) : (
                    <>
                      <TableHead className="font-medium">GPT-4</TableHead>
                      <TableHead className="font-medium">GPT-4o</TableHead>
                      <TableHead className="font-medium">Haiku</TableHead>
                    </>
                  )}
                  <TableHead className="font-medium w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((survey) => (
                  <TableRow key={survey.user_study_id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{survey.user_study_id}</TableCell>
                    <TableCell>{getMetadataValue(survey, "年齡")}</TableCell>
                    <TableCell>{getMetadataValue(survey, "戶籍所在地")}</TableCell>
                    <TableCell>{getMetadataValue(survey, "性別")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getMetadataValue(survey, "政黨支持傾向")}
                      </Badge>
                    </TableCell>
                    {currentModel ? (
                      <TableCell>
                        {(() => {
                          const prediction = getSingleModelPredictionForDisplay(survey)
                          return prediction && (
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: prediction.color,
                                color: "var(--background)"
                              }}
                            >
                              {prediction.name}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell>
                          {(() => {
                            const prediction = getMultiModelPredictionForDisplay(survey, "gpt-4")
                            return prediction && (
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: prediction.color,
                                  color: "var(--background)"
                                }}
                              >
                                {prediction.name}
                              </Badge>
                            )
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const prediction = getMultiModelPredictionForDisplay(survey, "gpt-4o")
                            return prediction && (
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: prediction.color,
                                  color: "var(--background)"
                                }}
                              >
                                {prediction.name}
                              </Badge>
                            )
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const prediction = getMultiModelPredictionForDisplay(survey, "haiku")
                            return prediction && (
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: prediction.color,
                                  color: "var(--background)"
                                }}
                              >
                                {prediction.name}
                              </Badge>
                            )
                          })()}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSurvey(survey)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detail Dialog */}
      <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-2xl bg-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Details - {selectedSurvey?.user_study_id}</DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {selectedSurvey.metadata.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{item.question}</span>
                    <span className="text-sm font-medium text-right max-w-[300px]">{item.answer}</span>
                  </div>
                ))}
              </div>
              
              {/* All Predictions */}
              {selectedSurvey && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">All Model Predictions</p>
                  {(() => {
                    const surveyPredictions = allPredictionsMap[selectedSurvey.user_study_id] || []
                    
                    return surveyPredictions.length > 0 ? (
                      <div className="space-y-3">
                        {surveyPredictions.map((pred, idx) => {
                          const candidate = CANDIDATES[pred.llm_answer]
                          let modelLabel = pred.engine 
                            ? (PREDICTION_MODELS.find(m => m.value === pred.engine)?.label || pred.engine)
                            : "Survey Intention"
                          
                          // Handle specific engine names
                          if (pred.engine === "claude-3-haiku-20240307") {
                            modelLabel = "Claude-3-haiku"
                          }
                          
                          return (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                  {modelLabel}
                                </span>
                                <Badge 
                                  className="text-xs w-fit"
                                  style={{ 
                                    backgroundColor: candidate.color,
                                    color: "var(--background)"
                                  }}
                                >
                                  {candidate.name}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No predictions found for this survey</p>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}