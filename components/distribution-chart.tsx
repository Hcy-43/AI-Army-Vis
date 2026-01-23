"use client"

import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList, ComposedChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CANDIDATES } from "@/lib/types"
import type { Prediction } from "@/lib/types"

interface DistributionChartProps {
  predictions: Prediction[]
}

// Real election results
const ELECTION_RESULTS: Record<string, number> = {
  "1": 40.05, // 賴清德
  "2": 33.49, // 侯友宜
  "3": 26.46, // 柯文哲
}

export function DistributionChart({ predictions }: DistributionChartProps) {
  // Calculate vote distribution
  const distribution = predictions.reduce(
    (acc, pred) => {
      acc[pred.llm_answer] = (acc[pred.llm_answer] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const total = predictions.length
  const chartData = Object.entries(CANDIDATES).map(([key, { name, color }]) => ({
    candidate: name,
    predictedPercentage: total > 0 ? ((distribution[key] || 0) / total * 100) : 0,
    actualPercentage: ELECTION_RESULTS[key],
    color: color,
  }))

  // Custom label component for predicted percentage
  const renderPredictedLabel = (props: any) => {
    const { x, y, width, value, height } = props
    return (
      <g>
        <text 
          x={x + width / 2} 
          y={y - 8} 
          fill="hsl(var(--foreground))" 
          textAnchor="middle" 
          fontSize={14}
          fontWeight={600}
        >
          {value.toFixed(1)}%
        </text>
        <text 
          x={x + width / 2} 
          y={y + height + 15} 
          fill="hsl(var(--foreground))" 
          textAnchor="middle" 
          fontSize={12}
        >
          Predicted
        </text>
      </g>
    )
  }

  // Custom label component for actual percentage
  const renderActualLabel = (props: any) => {
    const { x, y, width, value, height } = props
    return (
      <g>
        <text 
          x={x + width / 2} 
          y={y - 8} 
          fill="hsl(var(--muted-foreground))" 
          textAnchor="middle" 
          fontSize={12}
          fontWeight={500}
        >
          {value.toFixed(1)}%
        </text>
        <text 
          x={x + width / 2} 
          y={y + height + 15} 
          fill="hsl(var(--muted-foreground))" 
          textAnchor="middle" 
          fontSize={12}
        >
          Real
        </text>
      </g>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Vote Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Total responses: {total}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 30, right: 20, left: 20, bottom: 50 }}>
              <XAxis 
                type="category" 
                dataKey="candidate" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={16}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={25}
              />
              <YAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 50]}
                tickFormatter={(value) => `${value}%`}
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
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === "predictedPercentage" ? "Predicted" : "Actual Result"
                ]}
              />
              
              {/* Predicted bars */}
              <Bar dataKey="predictedPercentage" radius={[4, 4, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList content={renderPredictedLabel} />
              </Bar>
              
              {/* Actual result bars (semi-transparent overlay) */}
              <Bar dataKey="actualPercentage" radius={[4, 4, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-actual-${index}`} fill={entry.color} opacity={0.3} />
                ))}
                <LabelList content={renderActualLabel} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}