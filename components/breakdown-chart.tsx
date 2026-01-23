"use client"

import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { CANDIDATES } from "@/lib/types"
import type { SurveyData, Prediction } from "@/lib/types"

interface BreakdownChartProps {
  surveyData: SurveyData[]
  predictions: Prediction[]
}

const BREAKDOWN_OPTIONS = [
  { value: "政黨支持傾向", label: "Party Preference" },
  { value: "年齡", label: "Age Group" },
  { value: "性別", label: "Gender" },
  { value: "戶籍所在地", label: "Location" },
  { value: "身份認同（台灣人/中國人）", label: "Identity" },
]

export function BreakdownChart({ surveyData, predictions }: BreakdownChartProps) {
  const [breakdownBy, setBreakdownBy] = useState("政黨支持傾向")
  
  // Create a map of predictions by user study id
  const predictionMap = predictions.reduce((acc, pred) => {
    acc[pred.userstudyid] = pred.llm_answer
    return acc
  }, {} as Record<string, string>)
  
  // Group data by the selected breakdown field
  const groupedData: Record<string, Record<string, number>> = {}
  
  surveyData.forEach((survey) => {
    const breakdownValue = survey.metadata.find(m => m.question === breakdownBy)?.answer || "Unknown"
    const prediction = predictionMap[survey.user_study_id]
    
    if (!groupedData[breakdownValue]) {
      groupedData[breakdownValue] = {}
    }
    if (prediction) {
      groupedData[breakdownValue][prediction] = (groupedData[breakdownValue][prediction] || 0) + 1
    }
  })
  
  // Transform to chart data and sort by total count (descending)
  const chartData = Object.entries(groupedData)
    .map(([group, votes]) => {
      const candidateVotes = Object.fromEntries(
        Object.entries(CANDIDATES).map(([key, { name }]) => [name, votes[key] || 0])
      )
      const total = Object.values(candidateVotes).reduce((sum, count) => sum + count, 0)
      return {
        group,
        ...candidateVotes,
        total,
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-medium">Vote Breakdown</CardTitle>
          <Select value={breakdownBy} onValueChange={setBreakdownBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Breakdown by" />
            </SelectTrigger>
            <SelectContent>
              {BREAKDOWN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="group" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "#000000",
                }}
              />
              {Object.entries(CANDIDATES).map(([key, { name, color }]) => (
                <Bar key={key} dataKey={name} fill={color} stackId="a" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {Object.entries(CANDIDATES).map(([key, { name, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-sm text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}