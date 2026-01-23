"use client"

import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CANDIDATES } from "@/lib/types"
import type { Prediction } from "@/lib/types"

interface DistributionChartProps {
  predictions: Prediction[]
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
    votes: distribution[key] || 0,
    percentage: total > 0 ? ((distribution[key] || 0) / total * 100).toFixed(1) : "0",
    fill: color,
  }))

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Vote Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Total responses: {total}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
              <XAxis 
                type="category" 
                dataKey="candidate" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="number" 
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
                formatter={(value: number, _name: string, props: { payload?: { percentage?: string } }) => [
                  `${value} votes (${props.payload?.percentage}%)`,
                  "Votes",
                ]}
              />
              <Bar dataKey="votes" radius={[4, 4, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList 
                  dataKey="votes" 
                  position="top" 
                  fill="hsl(var(--foreground))" 
                  fontSize={14}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
