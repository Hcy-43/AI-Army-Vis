"use client"

import React from "react"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SURVEY_SOURCES, PREDICTION_MODELS } from "@/lib/types"
import type { SurveySource, PredictionModel } from "@/lib/types"
import { Database, Cpu, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CustomSetting {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string
}

interface SettingsPanelProps {
  surveySource: SurveySource
  predictionModel: PredictionModel
  onSurveySourceChange: (source: SurveySource) => void
  onPredictionModelChange: (model: PredictionModel) => void
  customSettings?: CustomSetting[]
  onCustomSettingChange?: (id: string, value: string) => void
  onAddCustomSetting?: () => void
  onRemoveCustomSetting?: (id: string) => void
  extraActions?: React.ReactNode
}

export function SettingsPanel({
  surveySource,
  predictionModel,
  onSurveySourceChange,
  onPredictionModelChange,
  customSettings = [],
  onCustomSettingChange,
  onRemoveCustomSetting,
  extraActions,
}: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Settings Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Database className="h-4 w-4" />
                Survey Data Source
              </div>
              <Select
                value={surveySource}
                onValueChange={(value) => onSurveySourceChange(value as SurveySource)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select survey source" />
                </SelectTrigger>
                <SelectContent>
                  {SURVEY_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Cpu className="h-4 w-4" />
                Prediction Model
              </div>
              <Select
                value={predictionModel}
                onValueChange={(value) => onPredictionModelChange(value as PredictionModel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select prediction model" />
                </SelectTrigger>
                <SelectContent>
                  {PREDICTION_MODELS
                    .filter((model) => {
                      // "real" model only available for "real" survey source
                      if (model.value === "real") return surveySource === "real"
                      return true
                    })
                    .map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Extra Actions (like Data Upload button) */}
            {extraActions && (
              <div className="flex items-end">
                {extraActions}
              </div>
            )}
          </div>

          {/* Custom Settings (Expandable) */}
          {customSettings.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="flex items-center gap-2">
                  Additional Filters
                  <Badge variant="secondary">{customSettings.length}</Badge>
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180"
                )} />
              </Button>

              {expanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-border">
                  {customSettings.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                          {setting.label}
                        </label>
                        {onRemoveCustomSetting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onRemoveCustomSetting(setting.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={setting.value}
                        onValueChange={(value) => onCustomSettingChange?.(setting.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${setting.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
