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
import { ChevronLeft, ChevronRight, Search, Eye } from "lucide-react"

interface SurveyTableProps {
  surveyData: SurveyData[]
  predictions: Prediction[]
}

export function SurveyTable({ surveyData, predictions }: SurveyTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData | null>(null)
  
  const pageSize = 10
  
  // Create a map of predictions by user study id
  const predictionMap = predictions.reduce((acc, pred) => {
    acc[pred.userstudyid] = pred
    return acc
  }, {} as Record<string, Prediction>)
  
  // Filter data based on search
  const filteredData = surveyData.filter((survey) => {

    if (!predictionMap[survey.user_study_id]) return false 
    
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      survey.user_study_id.toLowerCase().includes(searchLower) ||
      survey.metadata.some(m => 
        m.answer.toLowerCase().includes(searchLower) ||
        m.question.toLowerCase().includes(searchLower)
      )
    )
  })
  
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)
  
  // Get key metadata for display
  const getMetadataValue = (survey: SurveyData, question: string) => {
    return survey.metadata.find(m => m.question === question)?.answer || "-"
  }
  
  const getPrediction = (survey: SurveyData) => {
    const pred = predictionMap[survey.user_study_id]
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
                  <TableHead className="font-medium">Prediction</TableHead>
                  <TableHead className="font-medium w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((survey) => {
                  const prediction = getPrediction(survey)
                  return (
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
                      <TableCell>
                        {prediction && (
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: prediction.color,
                              color: "var(--background)"
                            }}
                          >
                            {prediction.name}
                          </Badge>
                        )}
                      </TableCell>
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
                  )
                })}
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
        <DialogContent className="max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle>Survey Details - {selectedSurvey?.user_study_id}</DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {selectedSurvey.metadata.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{item.question}</span>
                    <span className="text-sm font-medium text-right max-w-[200px]">{item.answer}</span>
                  </div>
                ))}
              </div>
              
              {/* Prediction */}
              {predictionMap[selectedSurvey.user_study_id] && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Model Prediction</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const pred = getPrediction(selectedSurvey)
                      return pred ? (
                        <Badge 
                          className="text-sm"
                          style={{ 
                            backgroundColor: pred.color,
                            color: "var(--background)"
                          }}
                        >
                          {pred.name}
                        </Badge>
                      ) : null
                    })()}
                    {/* <span className="text-sm text-muted-foreground">
                      (confidence: {Math.abs(predictionMap[selectedSurvey.user_study_id].llm_answer_logprob).toFixed(3)})
                    </span> */}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
