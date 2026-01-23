"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CANDIDATES } from "@/lib/types"
import type { Prediction } from "@/lib/types"
import { Users, Vote, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  predictions: Prediction[]
}

export function StatsCards({ predictions }: StatsCardsProps) {
  const total = predictions.length
  
  // Calculate distribution
  const distribution = predictions.reduce(
    (acc, pred) => {
      acc[pred.llm_answer] = (acc[pred.llm_answer] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  
  // Find winner
  const winner = Object.entries(distribution).reduce((a, b) => 
    (distribution[a[0]] || 0) > (distribution[b[0]] || 0) ? a : b
  )
  
  const winnerInfo = CANDIDATES[winner[0]]
  const winnerPercentage = ((winner[1] / total) * 100).toFixed(1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Respondents</p>
              <p className="text-2xl font-semibold">{total.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Vote className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Candidates</p>
              <p className="text-2xl font-semibold">{Object.keys(CANDIDATES).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `color-mix(in oklch, ${winnerInfo?.color || 'var(--primary)'} 20%, transparent)` }}>
              <TrendingUp className="h-6 w-6" style={{ color: winnerInfo?.color || 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leading Candidate</p>
              <p className="text-2xl font-semibold">{winnerInfo?.name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{winnerPercentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
